"""
Log Monitor Fixture
Captures and analyzes logs during test execution
Detects errors even when fallback succeeds
"""
import pytest
import logging
import sys
from pathlib import Path
from collections import defaultdict
from typing import List, Dict


class LogMonitor:
    """Monitor logs during tests and detect issues"""
    
    def __init__(self):
        self.logs: List[str] = []
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.degraded_indicators: List[str] = []
        self.api_failures: List[Dict] = []
        
    def capture_log(self, record):
        """Capture a log record"""
        message = record.getMessage()
        self.logs.append(message)
        
        # Detect errors
        if record.levelno >= logging.ERROR or "ERROR" in message or "Exception" in message:
            self.errors.append(message)
        
        # Detect warnings
        if record.levelno == logging.WARNING or "WARNING" in message:
            self.warnings.append(message)
        
        # Detect degraded state indicators
        degraded_patterns = [
            "falling back",
            "fallback",
            "degraded",
            "retry attempt",
            "using local"
        ]
        if any(pattern in message.lower() for pattern in degraded_patterns):
            self.degraded_indicators.append(message)
        
        # Detect API failures
        api_failure_patterns = [
            "API failed",
            "Bad Request",
            "400",
            "401",
            "403",
            "429",
            "500",
            "502",
            "503",
            "Connection refused",
            "Timeout"
        ]
        if any(pattern in message for pattern in api_failure_patterns):
            self.api_failures.append({
                "message": message,
                "level": record.levelname,
                "timestamp": record.created
            })
    
    def has_errors(self) -> bool:
        """Check if any errors were logged"""
        return len(self.errors) > 0
    
    def has_warnings(self) -> bool:
        """Check if any warnings were logged"""
        return len(self.warnings) > 0
    
    def is_degraded(self) -> bool:
        """Check if system is in degraded state"""
        return len(self.degraded_indicators) > 0
    
    def has_api_failures(self) -> bool:
        """Check if any API failures occurred"""
        return len(self.api_failures) > 0
    
    def get_summary(self) -> Dict:
        """Get summary of captured logs"""
        return {
            "total_logs": len(self.logs),
            "errors": len(self.errors),
            "warnings": len(self.warnings),
            "degraded_indicators": len(self.degraded_indicators),
            "api_failures": len(self.api_failures),
            "is_healthy": not self.has_errors() and not self.has_api_failures(),
            "is_degraded": self.is_degraded()
        }
    
    def get_report(self) -> str:
        """Get human-readable report"""
        summary = self.get_summary()
        
        lines = []
        lines.append("=" * 60)
        lines.append("LOG MONITOR REPORT")
        lines.append("=" * 60)
        lines.append(f"Total logs captured: {summary['total_logs']}")
        lines.append(f"Errors: {summary['errors']}")
        lines.append(f"Warnings: {summary['warnings']}")
        lines.append(f"Degraded indicators: {summary['degraded_indicators']}")
        lines.append(f"API failures: {summary['api_failures']}")
        lines.append("")
        
        if summary['is_healthy']:
            lines.append("✅ STATUS: HEALTHY")
        elif summary['is_degraded']:
            lines.append("⚠️  STATUS: DEGRADED")
        else:
            lines.append("❌ STATUS: ERROR")
        
        if self.errors:
            lines.append("")
            lines.append("ERRORS DETECTED:")
            for error in self.errors[:5]:  # Show first 5
                lines.append(f"  • {error}")
        
        if self.degraded_indicators:
            lines.append("")
            lines.append("DEGRADED STATE INDICATORS:")
            for indicator in self.degraded_indicators[:5]:
                lines.append(f"  • {indicator}")
        
        if self.api_failures:
            lines.append("")
            lines.append("API FAILURES:")
            for failure in self.api_failures[:5]:
                lines.append(f"  • {failure['message']}")
        
        lines.append("=" * 60)
        
        return "\n".join(lines)


@pytest.fixture
def log_monitor():
    """Fixture that captures logs during test execution"""
    monitor = LogMonitor()
    
    # Create custom handler
    class TestLogHandler(logging.Handler):
        def emit(self, record):
            monitor.capture_log(record)
    
    handler = TestLogHandler()
    handler.setLevel(logging.DEBUG)
    
    # Add handler to root logger
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    original_level = root_logger.level
    root_logger.setLevel(logging.DEBUG)
    
    yield monitor
    
    # Cleanup
    root_logger.removeHandler(handler)
    root_logger.setLevel(original_level)
    
    # Print report if there are issues
    if monitor.has_errors() or monitor.is_degraded():
        print("\n" + monitor.get_report())


@pytest.fixture
def log_file_monitor():
    """Fixture that monitors log files during test"""
    log_dir = Path(__file__).parent.parent.parent / "logs"
    backend_log = log_dir / "backend.log"
    frontend_log = log_dir / "frontend.log"
    
    # Get initial file positions
    initial_positions = {}
    for log_file in [backend_log, frontend_log]:
        if log_file.exists():
            initial_positions[log_file] = log_file.stat().st_size
        else:
            initial_positions[log_file] = 0
    
    yield
    
    # Read new log lines
    new_errors = []
    new_warnings = []
    
    for log_file, initial_pos in initial_positions.items():
        if log_file.exists():
            with open(log_file, 'r') as f:
                f.seek(initial_pos)
                new_lines = f.readlines()
                
                for line in new_lines:
                    line_lower = line.lower()
                    if 'error' in line_lower or 'exception' in line_lower or 'failed' in line_lower:
                        new_errors.append(f"[{log_file.name}] {line.strip()}")
                    elif 'warning' in line_lower or 'fallback' in line_lower:
                        new_warnings.append(f"[{log_file.name}] {line.strip()}")
    
    # Report findings
    if new_errors:
        print("\n" + "=" * 60)
        print("ERRORS FOUND IN LOG FILES DURING TEST:")
        print("=" * 60)
        for error in new_errors[:10]:
            print(f"  {error}")
        print("=" * 60)
    
    if new_warnings:
        print("\n" + "=" * 60)
        print("WARNINGS FOUND IN LOG FILES DURING TEST:")
        print("=" * 60)
        for warning in new_warnings[:10]:
            print(f"  {warning}")
        print("=" * 60)
