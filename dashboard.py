#!/usr/bin/env python3
"""
LitReview Dashboard - Real-time monitoring with colorful CLI
Displays system status, logs, metrics, and errors in a rich terminal UI

Note: Run from project root, will use backend venv if available
"""

import sys
from pathlib import Path

# Try to use backend venv if available
venv_python = Path("backend/venv/bin/python3")
if venv_python.exists() and sys.executable != str(venv_python.absolute()):
    import os
    import subprocess
    # Re-run with venv python
    os.execv(str(venv_python.absolute()), [str(venv_python.absolute())] + sys.argv)

import time
from datetime import datetime
from collections import deque
import threading
import subprocess

# Try to install dependencies if needed
try:
    from rich.console import Console
    from rich.layout import Layout
    from rich.panel import Panel
    from rich.table import Table
    from rich.live import Live
    from rich.text import Text
    from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
    from rich import box
    from rich.align import Align
except ImportError:
    print("📦 Installing dashboard dependencies (rich)...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "rich", "-q"])
    from rich.console import Console
    from rich.layout import Layout
    from rich.panel import Panel
    from rich.table import Table
    from rich.live import Live
    from rich.text import Text
    from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
    from rich import box
    from rich.align import Align

try:
    import requests
except ImportError:
    print("📦 Installing dashboard dependencies (requests)...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests

console = Console()

class DashboardMonitor:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.backend_logs = deque(maxlen=50)
        self.frontend_logs = deque(maxlen=50)
        self.error_logs = deque(maxlen=20)
        self.pipeline_events = deque(maxlen=100)
        self.backend_status = "🔴 Offline"
        self.frontend_status = "🔴 Offline"
        self.request_count = 0
        self.error_count = 0
        self.avg_response_time = 0
        self.active_sessions = 0
        self.running = True
        
        # New: LLM and GPU tracking
        self.llm_calls = 0
        self.llm_tokens = 0
        self.gpu_available = False
        self.gpu_name = "N/A"
        self.gpu_memory_used = 0
        self.gpu_memory_total = 0
        self.gpu_utilization = 0
        
        # New: Pipeline tracking
        self.current_pipeline_stage = 0
        self.pipeline_progress = {}  # stage -> progress %
        self.active_pipeline_id = None
        
        # Paths
        self.backend_log = Path("logs/backend.log")
        self.frontend_log = Path("logs/frontend.log")
        self.pipeline_events_log = Path("logs/pipeline_events.log")
        self.pids_file = Path(".pids")
        
        # Start log watchers
        self.start_log_watchers()
    
    def start_log_watchers(self):
        """Start background threads to watch log files"""
        threading.Thread(target=self.watch_backend_log, daemon=True).start()
        threading.Thread(target=self.watch_frontend_log, daemon=True).start()
        threading.Thread(target=self.watch_pipeline_events, daemon=True).start()
        threading.Thread(target=self.check_health, daemon=True).start()
    
    def watch_backend_log(self):
        """Watch backend log file for updates"""
        if not self.backend_log.exists():
            return
        
        with open(self.backend_log, 'r') as f:
            f.seek(0, 2)  # Go to end
            while self.running:
                line = f.readline()
                if line:
                    line = line.strip()
                    self.backend_logs.append(line)
                    if any(err in line.lower() for err in ['error', 'exception', 'failed', 'traceback']):
                        self.error_logs.append(f"[Backend] {line}")
                        self.error_count += 1
                time.sleep(0.1)
    
    def watch_frontend_log(self):
        """Watch frontend log file for updates"""
        if not self.frontend_log.exists():
            return
        
        with open(self.frontend_log, 'r') as f:
            f.seek(0, 2)  # Go to end
            while self.running:
                line = f.readline()
                if line:
                    line = line.strip()
                    self.frontend_logs.append(line)
                    if any(err in line.lower() for err in ['error', 'failed', 'warning']):
                        self.error_logs.append(f"[Frontend] {line}")
                time.sleep(0.1)
    
    def watch_pipeline_events(self):
        """Watch pipeline events log file for updates"""
        if not self.pipeline_events_log.exists():
            # Wait for file to be created
            while self.running and not self.pipeline_events_log.exists():
                time.sleep(1)
        
        if not self.running:
            return
        
        import json
        with open(self.pipeline_events_log, 'r') as f:
            f.seek(0, 2)  # Go to end
            while self.running:
                line = f.readline()
                if line:
                    try:
                        event = json.loads(line.strip())
                        self.pipeline_events.append(event)
                        
                        # Track pipeline state
                        if event.get('type') == 'stage_update':
                            stage = event.get('stage', 0)
                            progress = event.get('progress', 0)
                            self.current_pipeline_stage = stage
                            self.pipeline_progress[stage] = progress
                            self.active_pipeline_id = event.get('session_id')
                        elif event.get('type') == 'stage_complete':
                            stage = event.get('stage', 0)
                            self.pipeline_progress[stage] = 100
                    except:
                        pass
                time.sleep(0.1)
    
    def check_health(self):
        """Check backend and frontend health"""
        while self.running:
            # Check backend
            try:
                start = time.time()
                response = requests.get(f"{self.backend_url}/health", timeout=2)
                elapsed = (time.time() - start) * 1000
                if response.status_code == 200:
                    self.backend_status = "🟢 Online"
                    self.avg_response_time = elapsed
                    self.request_count += 1
                else:
                    self.backend_status = "🟡 Degraded"
            except:
                self.backend_status = "🔴 Offline"
            
            # Check frontend
            try:
                requests.get(self.frontend_url, timeout=2)
                self.frontend_status = "🟢 Online"
            except:
                self.frontend_status = "🔴 Offline"
            
            # Update GPU stats
            self.update_gpu_stats()
            
            time.sleep(2)
    
    def update_gpu_stats(self):
        """Update GPU statistics"""
        try:
            # Try backend API first
            response = requests.get(f"{self.backend_url}/api/monitoring/gpu-stats", timeout=1)
            if response.status_code == 200:
                data = response.json()
                self.gpu_available = data.get("device") == "cuda"
                self.gpu_name = data.get("gpu_name", "N/A")
                self.gpu_memory_used = data.get("memory_allocated_mb", 0)
                self.gpu_memory_total = data.get("memory_total_gb", 0) * 1024  # Convert to MB
                return
        except:
            pass
        
        # Fallback to nvidia-smi
        try:
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=name,memory.used,memory.total,utilization.gpu', 
                 '--format=csv,noheader,nounits'],
                capture_output=True,
                text=True,
                timeout=1
            )
            if result.returncode == 0:
                parts = result.stdout.strip().split(',')
                self.gpu_available = True
                self.gpu_name = parts[0].strip()
                self.gpu_memory_used = float(parts[1].strip())
                self.gpu_memory_total = float(parts[2].strip())
                self.gpu_utilization = int(parts[3].strip())
        except:
            self.gpu_available = False
    
    def get_pids(self):
        """Get process IDs from .pids file"""
        if not self.pids_file.exists():
            return None, None
        
        with open(self.pids_file, 'r') as f:
            lines = f.readlines()
            backend_pid = None
            frontend_pid = None
            for line in lines:
                if 'BACKEND_PID' in line:
                    backend_pid = line.split('=')[1].strip()
                elif 'FRONTEND_PID' in line:
                    frontend_pid = line.split('=')[1].strip()
        return backend_pid, frontend_pid
    
    def create_header(self) -> Panel:
        """Create enhanced dashboard header with gradient effect"""
        title = Text()
        title.append("╔══════════════════════════════════════════════════════════════╗\n", style="bold cyan")
        title.append("║  ", style="bold cyan")
        title.append("🚀 LitReview Dashboard", style="bold white on blue")
        title.append("  │  ", style="bold cyan")
        title.append("Real-Time Monitoring & Diagnostics", style="bold yellow")
        title.append("  ║\n", style="bold cyan")
        title.append("╚══════════════════════════════════════════════════════════════╝", style="bold cyan")
        
        timestamp = Text()
        timestamp.append("\n🕐 ", style="yellow")
        timestamp.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), style="bold white")
        timestamp.append("  │  ", style="dim")
        timestamp.append("⚡ Auto-refresh: 0.5s", style="dim green")
        
        content = Text()
        content.append(title)
        content.append(timestamp)
        
        return Panel(
            Align.center(content),
            box=box.HEAVY,
            style="bold cyan",
            border_style="bright_cyan"
        )
    
    def create_status_panel(self) -> Panel:
        """Create system status panel"""
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Service", style="cyan", width=20)
        table.add_column("Status", width=20)
        table.add_column("Metrics", style="dim")
        
        backend_pid, frontend_pid = self.get_pids()
        
        # Backend status
        backend_metrics = f"PID: {backend_pid or 'N/A'} | Resp: {self.avg_response_time:.0f}ms"
        table.add_row(
            "🔧 Backend API",
            self.backend_status,
            backend_metrics
        )
        
        # Frontend status
        frontend_metrics = f"PID: {frontend_pid or 'N/A'}"
        table.add_row(
            "🎨 Frontend UI",
            self.frontend_status,
            frontend_metrics
        )
        
        # Endpoints
        table.add_row("", "", "")
        table.add_row(
            "📍 API Endpoint",
            "[link]http://localhost:8000[/link]",
            "FastAPI + WebSockets"
        )
        table.add_row(
            "📍 UI Endpoint",
            "[link]http://localhost:3000[/link]",
            "React + Vite"
        )
        
        return Panel(
            table,
            title="[bold green]System Status[/bold green]",
            border_style="green",
            box=box.ROUNDED
        )
    
    def create_metrics_panel(self) -> Panel:
        """Create metrics panel with GPU and LLM stats"""
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Metric", style="cyan", width=25)
        table.add_column("Value", style="bold yellow", width=20)
        
        # System Metrics
        table.add_row("📊 Total Requests", str(self.request_count))
        table.add_row("⚠️  Error Count", str(self.error_count))
        table.add_row("⚡ Avg Response", f"{self.avg_response_time:.0f}ms")
        table.add_row("🔌 Active Sessions", str(self.active_sessions))
        
        uptime = self.get_uptime()
        table.add_row("⏱️  Uptime", uptime)
        
        return Panel(
            table,
            title="[bold yellow]System Metrics[/bold yellow]",
            border_style="yellow",
            box=box.ROUNDED
        )
    
    def create_gpu_llm_panel(self) -> Panel:
        """Create GPU and LLM monitoring panel"""
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Item", style="cyan", width=25)
        table.add_column("Value", style="bold green", width=20)
        
        # GPU Stats
        if self.gpu_available:
            table.add_row("🎮 GPU Status", "🟢 Available")
            table.add_row("   Device", self.gpu_name[:20])
            
            # Memory bar
            if self.gpu_memory_total > 0:
                used_pct = (self.gpu_memory_used / self.gpu_memory_total) * 100
                memory_str = f"{self.gpu_memory_used:.0f}/{self.gpu_memory_total:.0f}MB ({used_pct:.1f}%)"
                table.add_row("   VRAM", memory_str)
                
                # Visual memory bar
                bar_width = 15
                filled = int((used_pct / 100) * bar_width)
                bar = "█" * filled + "░" * (bar_width - filled)
                color = "green" if used_pct < 70 else "yellow" if used_pct < 90 else "red"
                table.add_row("   Usage", f"[{color}]{bar}[/{color}]")
            
            if self.gpu_utilization > 0:
                util_color = "green" if self.gpu_utilization < 70 else "yellow" if self.gpu_utilization < 90 else "red"
                table.add_row("   Utilization", f"[{util_color}]{self.gpu_utilization}%[/{util_color}]")
        else:
            table.add_row("🎮 GPU Status", "🔴 Not Available")
            table.add_row("   Device", "CPU Only")
        
        # LLM Stats
        table.add_row("", "")
        table.add_row("🤖 LLM Calls", str(self.llm_calls))
        table.add_row("📝 Tokens Processed", f"{self.llm_tokens:,}")
        
        return Panel(
            table,
            title="[bold magenta]GPU & LLM Monitor[/bold magenta]",
            border_style="magenta",
            box=box.ROUNDED
        )
    
    
    def create_pipeline_status_panel(self) -> Panel:
        """Create pipeline stage visualization panel"""
        stages = [
            ("1️⃣ ", "Fetch Papers", "Semantic Scholar"),
            ("2️⃣ ", "Relevance Score", "AI Scoring"),
            ("3️⃣ ", "Theme Grouping", "Clustering"),
            ("4️⃣ ", "Methodology", "Classification"),
            ("5️⃣ ", "Ranking", "Multi-factor"),
            ("6️⃣ ", "Synthesis", "LLM Summary"),
            ("7️⃣ ", "PDF Export", "WeasyPrint"),
        ]
        
        if not self.active_pipeline_id:
            content = Text("No active pipeline. Start a review to see progress here.", style="dim italic")
        else:
            content = ""
            session_short = self.active_pipeline_id[:8] if self.active_pipeline_id else "N/A"
            content += f"[bold cyan]Active Pipeline:[/bold cyan] {session_short}\n\n"
            
            for i, (emoji, name, tech) in enumerate(stages, 1):
                progress = self.pipeline_progress.get(i, 0)
                
                # Status indicator
                if progress == 100:
                    status = "[green]✓ DONE[/green]"
                    line_color = "dim green"
                elif progress > 0:
                    status = f"[yellow]⏳ {progress}%[/yellow]"
                    line_color = "bold yellow"
                elif i == self.current_pipeline_stage:
                    status = "[cyan]▶ IN PROGRESS[/cyan]"
                    line_color = "bold cyan"
                else:
                    status = "[dim]⏸ PENDING[/dim]"
                    line_color = "dim"
                
                # Progress bar
                bar_width = 15
                filled = int((progress / 100) * bar_width) if progress > 0 else 0
                bar = "█" * filled + "░" * (bar_width - filled)
                
                content += f"[{line_color}]{emoji}{name:<18}[/{line_color}] "
                content += f"{bar} {status}\n"
                content += f"[dim]   {tech}[/dim]\n"
        
        return Panel(
            content,
            title="[bold green]Pipeline Stages[/bold green]",
            border_style="green",
            box=box.ROUNDED,
            height=22
        )
    
    def get_uptime(self) -> str:
        """Calculate uptime from PID start time"""
        backend_pid, _ = self.get_pids()
        if not backend_pid:
            return "N/A"
        
        try:
            # Get process start time (Linux)
            result = subprocess.run(
                ['ps', '-p', backend_pid, '-o', 'etime='],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except:
            pass
        return "N/A"
    
    def create_errors_panel(self) -> Panel:
        """Create errors panel"""
        if not self.error_logs:
            content = Text("✨ No errors! System running smoothly.", style="green")
        else:
            content = ""
            for error in list(self.error_logs)[-10:]:  # Last 10 errors
                content += f"❌ {error}\n"
        
        return Panel(
            content,
            title="[bold red]Recent Errors[/bold red]",
            border_style="red",
            box=box.ROUNDED,
            height=12
        )
    
    def create_backend_logs_panel(self) -> Panel:
        """Create backend logs panel"""
        if not self.backend_logs:
            content = Text("Waiting for backend logs...", style="dim")
        else:
            content = ""
            for log in list(self.backend_logs)[-15:]:  # Last 15 lines
                if 'error' in log.lower():
                    content += f"[red]{log}[/red]\n"
                elif 'warning' in log.lower():
                    content += f"[yellow]{log}[/yellow]\n"
                elif 'info' in log.lower() or 'started' in log.lower():
                    content += f"[green]{log}[/green]\n"
                else:
                    content += f"[dim]{log}[/dim]\n"
        
        return Panel(
            content,
            title="[bold blue]Backend Logs[/bold blue]",
            border_style="blue",
            box=box.ROUNDED,
            height=18
        )
    
    def create_frontend_logs_panel(self) -> Panel:
        """Create frontend logs panel"""
        if not self.frontend_logs:
            content = Text("Waiting for frontend logs...", style="dim")
        else:
            content = ""
            for log in list(self.frontend_logs)[-15:]:  # Last 15 lines
                if 'error' in log.lower():
                    content += f"[red]{log}[/red]\n"
                elif 'warning' in log.lower():
                    content += f"[yellow]{log}[/yellow]\n"
                elif 'vite' in log.lower() or 'ready' in log.lower():
                    content += f"[cyan]{log}[/cyan]\n"
                else:
                    content += f"[dim]{log}[/dim]\n"
        
        return Panel(
            content,
            title="[bold cyan]Frontend Logs[/bold cyan]",
            border_style="cyan",
            box=box.ROUNDED,
            height=18
        )
    
    def create_pipeline_events_panel(self) -> Panel:
        """Create pipeline events panel for detailed debugging"""
        if not self.pipeline_events:
            content = Text("No pipeline events yet. Run a pipeline to see events here.", style="dim")
        else:
            content = ""
            for event in list(self.pipeline_events)[-20:]:  # Last 20 events
                timestamp = event.get('timestamp', '')[:19].replace('T', ' ')  # Format timestamp
                event_type = event.get('type', 'unknown')
                stage = event.get('stage', '-')
                message = event.get('message', '')
                progress = event.get('progress', '')
                session_id = event.get('session_id', '')[:8]  # Short session ID
                
                # Color code by event type
                if event_type == 'error':
                    line = f"[red]⚠️ {timestamp} | Stage {stage} | {message}[/red]"
                elif event_type == 'stage_complete':
                    line = f"[green]✓ {timestamp} | Stage {stage} COMPLETE[/green]"
                elif event_type == 'stage_update':
                    prog_display = f"{progress}%" if progress else ""
                    line = f"[cyan]▶ {timestamp} | Stage {stage} ({prog_display}) | {message}[/cyan]"
                elif event_type == 'connected':
                    line = f"[yellow]🔌 {timestamp} | Session {session_id} connected[/yellow]"
                else:
                    line = f"[dim]  {timestamp} | {event_type} | {message}[/dim]"
                
                content += line + "\n"
        
        return Panel(
            content,
            title="[bold magenta]Pipeline Events (Detailed)[/bold magenta]",
            border_style="magenta",
            box=box.ROUNDED,
            height=20
        )
    
    def create_footer(self) -> Panel:
        """Create enhanced dashboard footer"""
        footer = Text()
        footer.append("╔", style="dim cyan")
        footer.append("══════════════════════════════════════════════════════════════════════════════════════════════════", style="dim cyan")
        footer.append("╗\n", style="dim cyan")
        footer.append("║ ", style="dim cyan")
        
        footer.append("🎮 Controls: ", style="bold white")
        footer.append("Ctrl+C", style="bold red")
        footer.append(" = Exit Dashboard", style="dim")
        footer.append("  │  ", style="dim cyan")
        
        footer.append("📝 Logs: ", style="bold white")
        footer.append("tail -f logs/*.log", style="cyan")
        footer.append("  │  ", style="dim cyan")
        
        footer.append("🛑 Stop: ", style="bold white")
        footer.append("./stop.sh", style="yellow")
        footer.append("  │  ", style="dim cyan")
        
        footer.append("📚 Docs: ", style="bold white")
        footer.append("localhost:8000/docs", style="green")
        
        footer.append(" ║\n", style="dim cyan")
        footer.append("╚", style="dim cyan")
        footer.append("══════════════════════════════════════════════════════════════════════════════════════════════════", style="dim cyan")
        footer.append("╝", style="dim cyan")
        
        return Panel(
            Align.center(footer),
            style="dim",
            box=box.SIMPLE,
            border_style="dim cyan"
        )
    
    def create_layout(self) -> Layout:
        """Create enhanced 3-column dashboard layout"""
        layout = Layout()
        
        # Define layout structure
        layout.split(
            Layout(name="header", size=3),
            Layout(name="body"),
            Layout(name="footer", size=3)
        )
        
        # Split body into three columns
        layout["body"].split_row(
            Layout(name="left", ratio=1),
            Layout(name="middle", ratio=1),
            Layout(name="right", ratio=1)
        )
        
        # Left column: System Status, Metrics, GPU/LLM
        layout["left"].split(
            Layout(name="status", size=12),
            Layout(name="metrics", size=8),
            Layout(name="gpu_llm", size=14),
            Layout(name="errors")
        )
        
        # Middle column: Pipeline Status + Events
        layout["middle"].split(
            Layout(name="pipeline_status", size=24),
            Layout(name="pipeline_events")
        )
        
        # Right column: Backend and Frontend Logs
        layout["right"].split(
            Layout(name="backend_logs"),
            Layout(name="frontend_logs")
        )
        
        return layout
    
    def update_layout(self, layout: Layout):
        """Update layout with current data"""
        layout["header"].update(self.create_header())
        layout["status"].update(self.create_status_panel())
        layout["metrics"].update(self.create_metrics_panel())
        layout["gpu_llm"].update(self.create_gpu_llm_panel())
        layout["errors"].update(self.create_errors_panel())
        layout["pipeline_status"].update(self.create_pipeline_status_panel())
        layout["pipeline_events"].update(self.create_pipeline_events_panel())
        layout["backend_logs"].update(self.create_backend_logs_panel())
        layout["frontend_logs"].update(self.create_frontend_logs_panel())
        layout["footer"].update(self.create_footer())
    
    def run(self):
        """Run the dashboard"""
        layout = self.create_layout()
        
        try:
            with Live(layout, refresh_per_second=2, screen=True) as live:
                while True:
                    self.update_layout(layout)
                    time.sleep(0.5)
        except KeyboardInterrupt:
            self.running = False
            console.print("\n[yellow]Dashboard stopped. Servers are still running.[/yellow]")
            console.print("[blue]Use ./stop.sh to stop the servers.[/blue]\n")


def main():
    """Main entry point"""
    console.clear()
    
    # Show startup message
    console.print("\n[bold cyan]🚀 Starting LitReview Dashboard...[/bold cyan]\n")
    time.sleep(1)
    
    # Check if logs directory exists
    if not Path("logs").exists():
        console.print("[yellow]⚠️  Logs directory not found. Make sure the app is running![/yellow]")
        console.print("[blue]Run: ./run.sh[/blue]\n")
        return
    
    # Check if servers are running
    pids_file = Path(".pids")
    if not pids_file.exists():
        console.print("[yellow]⚠️  No running servers detected (.pids file not found)[/yellow]")
        console.print("[blue]Run: ./run.sh[/blue]\n")
        return
    
    # Start dashboard
    dashboard = DashboardMonitor()
    dashboard.run()


if __name__ == "__main__":
    main()
