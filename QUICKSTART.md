# 🚀 LitReview - Quick Start Guide

## One-Command Launch

```bash
./run.sh
```

**That's it!** The script will:
- ✅ Check dependencies
- ✅ Start backend server (port 8000)
- ✅ Start frontend server (port 3000)
- ✅ Show you where to access the app

---

## To Stop

```bash
./stop.sh
```

---

## Access the Application

**Frontend UI:** http://localhost:3000  
**Backend API:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs  

---

## First Time Setup

If it's your first time running the app:

```bash
./setup.sh    # Install dependencies
./run.sh      # Start the app
```

---

## Usage

1. Open http://localhost:3000
2. Enter keywords (e.g., "machine learning", "neural networks")
3. Click "Start Literature Review"
4. Watch the real-time progress
5. Download your PDF when complete!

---

## Available Scripts

| Script | Purpose |
|--------|---------|
| `./run.sh` | 🚀 Start both servers |
| `./stop.sh` | 🛑 Stop both servers |
| `./setup.sh` | 📦 Install all dependencies |
| `./verify.sh` | ✅ Verify project structure |

---

## Logs

Backend logs: `tail -f logs/backend.log`  
Frontend logs: `tail -f logs/frontend.log`  

---

## Troubleshooting

**Port already in use?**
```bash
./stop.sh    # Kills processes on ports 8000 & 3000
./run.sh     # Start fresh
```

**Dependencies missing?**
```bash
./setup.sh   # Reinstall everything
./run.sh
```

**API keys not working?**
- Edit `backend/.env`
- Add your `HF_TOKEN` and `SEMANTIC_SCHOLAR_API_KEY`
- Restart with `./stop.sh && ./run.sh`

---

## System Requirements

- Python 3.11+
- Node.js 18+
- 4GB RAM minimum
- 10GB disk space (for AI models)

---

**Built with MARKO v5.0 Framework**  
**Repository:** https://github.com/mei-the-dev/litreview-app
