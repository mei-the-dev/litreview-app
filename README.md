# LitReview - Automated Academic Literature Review System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**AI-powered system for automated academic literature review using Semantic Scholar API, HuggingFace models, and beautiful glassmorphism UI with real-time WebSocket updates.**

Built with the **MARKO v5.0 Framework** - Single Source of Truth for AI-Powered Development.

---

## 🎯 Features

### 7-Stage Automated Pipeline

1. **📚 Fetch Papers** - Retrieve papers from Semantic Scholar API
2. **🎯 Relevance Scoring** - AI-powered semantic similarity scoring
3. **🌐 Theme Clustering** - Automatic thematic grouping using embeddings
4. **🔬 Methodology Classification** - Research method identification
5. **📊 Final Ranking** - Multi-factor scoring (relevance, citations, recency)
6. **📝 Synthesis Report** - AI-generated structured literature review
7. **📄 PDF Generation** - Beautiful academic-formatted PDF output

### Real-time Glassmorphism UI

- 🎨 Beautiful bento grid layout with live updates
- 🌓 Dark/Light mode toggle
- 📱 Fully responsive design
- ⚡ Real-time WebSocket pipeline progress
- 🎭 Smooth animations with Framer Motion

### AI Integration

- 🤖 **HuggingFace Inference API** for speed
- 💻 **Local model fallback** for reliability
- 🧠 Sentence transformers for embeddings
- 📖 BART for summarization

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- **npm** or **pnpm**

### Installation

```bash
# 1. Clone/navigate to project
cd litreview-app

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env and add your HuggingFace token (optional but recommended)

# 3. Frontend setup
cd ../frontend
npm install

# 4. Done! 🎉
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

Backend will run on `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- WebSocket: `ws://localhost:8000/ws/{session_id}`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 📖 Usage

1. **Open** `http://localhost:3000` in your browser
2. **Enter keywords** for your literature review (e.g., "machine learning", "climate change")
3. **Adjust** the maximum number of papers (10-200)
4. **Click** "Start Literature Review"
5. **Watch** the real-time progress in the bento grid
6. **Download** your PDF report when complete!

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18.2.0 + TypeScript 5.3.3
- Vite 5.0.11 (build tool)
- Zustand 4.4.7 (state management)
- TailwindCSS 3.4.1 (styling)
- Framer Motion 10.18.0 (animations)
- Axios 1.6.5 (HTTP client)

**Backend:**
- FastAPI 0.109.0 (API framework)
- Python 3.11+
- WebSockets (real-time updates)
- Transformers 4.36.2 (AI models)
- Sentence Transformers 2.2.2 (embeddings)
- WeasyPrint 60.2 (PDF generation)
- httpx 0.26.0 (async HTTP)

### Project Structure

```
litreview-app/
├── marko.json              # 🎯 MARKO configuration - Single source of truth
├── backend/
│   ├── main.py            # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── core/              # Config & WebSocket manager
│   ├── api/
│   │   ├── routers/       # API endpoints
│   │   └── models/        # Pydantic models
│   ├── domain/
│   │   ├── pipeline/      # 7 pipeline stages
│   │   └── pipeline_orchestrator.py
│   └── infrastructure/
│       ├── ai/            # HuggingFace client
│       └── external/      # Semantic Scholar client
└── frontend/
    ├── package.json
    ├── src/
    │   ├── components/
    │   │   ├── bento/     # Bento grid UI
    │   │   ├── Header.tsx
    │   │   ├── QueryInput.tsx
    │   │   └── StatsFooter.tsx
    │   ├── stores/        # Zustand stores
    │   ├── hooks/         # Custom hooks (WebSocket)
    │   ├── services/      # API client
    │   └── types/         # TypeScript types
    └── index.html
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```bash
# HuggingFace API Token (optional but recommended)
HF_TOKEN=your_token_here

# Semantic Scholar API Key (optional - for higher rate limits)
SEMANTIC_SCHOLAR_API_KEY=

# Force local models (set to true to skip API calls)
USE_LOCAL_MODELS=false

# Server config
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## 📊 API Documentation

### REST Endpoints

**POST /api/pipeline/start**
- Start a new literature review pipeline
- Body: `{ keywords: string[], max_papers: number }`
- Returns: `{ session_id, status, message, websocket_url }`

**GET /api/pipeline/status/{session_id}**
- Get current pipeline status

**GET /api/pipeline/result/{session_id}**
- Get final pipeline result (when completed)

**GET /health**
- Health check endpoint

**GET /docs**
- Interactive API documentation (Swagger UI)

### WebSocket Protocol

**Connect:** `ws://localhost:8000/ws/{session_id}`

**Message Types:**
```typescript
{
  type: 'connected' | 'stage_update' | 'stage_complete' | 'error',
  stage?: number,  // 1-7
  progress?: number,  // 0-100
  message?: string,
  data?: any,
  result?: any,
  timestamp: string
}
```

---

## 🎨 UI/UX Design

### Glassmorphism Bento Grid

The UI features a stunning glassmorphism design with a bento grid layout:

- **Dynamic cards** that animate and update in real-time
- **Stage-specific icons** and colors
- **Progress bars** with smooth animations
- **Shimmer effects** during processing
- **Completion indicators** with timing data
- **Theme toggle** (dark/light mode)

### Color Palette

- **Primary:** `#CC8844` (Warm gold)
- **Primary Light:** `#E6A966`
- **Primary Dark:** `#AA6622`
- **Accent:** `#F5EDD6` (Cream)
- **Backgrounds:** Gradient overlays with blur effects

---

## 🧪 Testing

### Quick Test

```bash
# Backend API test
curl http://localhost:8000/health

# Start a pipeline
curl -X POST http://localhost:8000/api/pipeline/start \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["artificial intelligence"], "max_papers": 10}'
```

### Sample Queries

- "machine learning neural networks"
- "climate change adaptation"
- "quantum computing algorithms"
- "deep learning computer vision"
- "blockchain consensus mechanisms"

---

## 🔍 MARKO Framework Integration

This project is built using **MARKO v5.0** (Machine-Readable Knowledge Objects):

### Benefits

- ✅ **Single source of truth** - All architecture, decisions, and plans in `marko.json`
- ✅ **Zero repeated questions** - AI agents read MARKO once
- ✅ **84% token reduction** - No redundant context
- ✅ **Perfect consistency** - Tech stack, naming conventions, patterns locked
- ✅ **Self-documenting** - Architecture always up-to-date

### Key MARKO Sections

- **tech_stack_manifest** - All dependencies with exact versions
- **architectural_schema** - Directory structure, naming conventions, patterns
- **data_flow_schema** - End-to-end data flow documentation
- **long_term_plan** - Tasks, goals, and roadmap
- **decision_log** - Architectural decision records (ADRs)

See `marko.json` for the complete specification.

---

## 📝 Example Output

### Literature Review Report Includes:

1. **Overview** - Query summary, paper counts, theme/methodology breakdown
2. **Thematic Analysis** - Papers grouped by discovered themes
3. **Methodological Distribution** - Research method classification
4. **Top Papers** - Highly relevant papers with full metadata
5. **Key Insights** - AI-generated summary of findings
6. **Beautiful PDF** - Academic formatting with custom styling

---

## 🚧 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Frontend build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**WebSocket connection fails:**
- Ensure backend is running on port 8000
- Check CORS settings in backend/.env
- Verify firewall settings

**PDF generation fails:**
- WeasyPrint requires system dependencies
- Ubuntu: `sudo apt-get install libpango-1.0-0 libpangoft2-1.0-0`
- macOS: `brew install pango`
- Falls back to HTML if PDF fails

**AI models slow/failing:**
- Set `USE_LOCAL_MODELS=true` in .env to use local models
- First run downloads models (~80MB-1.6GB)
- For faster inference, add HF_TOKEN to .env

---

## 🛣️ Roadmap

- [ ] Add paper citation network visualization
- [ ] Support for PDF upload and parsing
- [ ] Multi-language literature review
- [ ] Export to various formats (Word, LaTeX)
- [ ] Save and load previous reviews
- [ ] Collaborative review features
- [ ] Advanced filters (year range, venue, etc.)
- [ ] Integration with reference managers (Zotero, Mendeley)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Semantic Scholar** - For the excellent academic paper API
- **HuggingFace** - For AI models and inference API
- **MARKO Framework** - For structured, AI-friendly project organization
- **React & FastAPI** - For amazing developer experience

---

## 📧 Support

For issues, questions, or contributions:
- Check the `marko.json` for architecture details
- Review API docs at `/docs`
- Open an issue on GitHub

---

**Built with ❤️ using MARKO v5.0 Framework**

*Zero context waste, maximum productivity* 🚀
