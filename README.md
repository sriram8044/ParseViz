# ParseViz: Advanced Interactive Compiler Design Platform

ParseViz is a developer-grade, interactive educational and research platform for compiler construction, Context-Free Grammar (CFG) transformations, FIRST & FOLLOW derivation, LL(1) parsing table construction, and stepwise visual syntax tree generation.

---

## 🏛️ System Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Axios, D3.js, React Flow.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2.
- **Database**: SQLite (Local embedded).
- **Environment**: Windows 11 (Local development, No Docker).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v22+` & `npm`
- Python `3.11+`

### 1. Backend Setup & Run

Open a terminal in the root directory:
```powershell
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server (port 8000)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API Docs (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check Endpoint: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Demonstration Workflow: [http://127.0.0.1:8000/api/demo/workflow](http://127.0.0.1:8000/api/demo/workflow)

### 2. Frontend Setup & Run

Open a second terminal in the root directory:
```powershell
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite dev server (port 5173)
npm run dev
```
- Open Application in Browser: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing Backend

Run pytest from the `backend/` directory:
```powershell
cd backend
venv\Scripts\pytest
```
*Current test suite: 35 passing tests.*

---

## 📂 Navigation & Modules (Fully Interactive & Live)

| Route | Module | Purpose | Status |
|---|---|---|---|
| `/` | Dashboard | Overview, metrics, templates, module launchpads | ✅ Active |
| `/grammar-editor` | Grammar Editor | CFG definition, live parsing, symbol classification, template library | ✅ Active |
| `/transformations` | Transformation Studio | Left recursion elimination (direct & indirect) & Left factoring | ✅ Active |
| `/first-follow` | FIRST & FOLLOW | Derivation sets, nullables, & mathematical deduction logs | ✅ Active |
| `/ll1-table` | LL(1) Table | Predictive matrix $M[A, a]$ & conflict detection | ✅ Active |
| `/simulator` | Parsing Simulator | Interactive stack PDA playback controls & trace table | ✅ Active |
| `/parse-tree` | Parse Tree Visualizer | D3.js hierarchical syntax tree rendering with pan/zoom/export | ✅ Active |
| `/playground` | Grammar Playground | Batch input test harness & syntax verification | ✅ Active |
| `/learning-mode` | Learning Mode | Live guided compiler demonstration & tutorials | ✅ Active |
| `/comparison` | Comparison & Analysis | Grammar diffs, complexity benchmarks | ✅ Active |
| `/settings` | Settings | Backend status, SQLite config, system info | ✅ Active |

---

## 📚 Documentation Links
- [Grammar Notation Specification](GRAMMAR_NOTATION.md)
- [REST API Documentation](API_DOCUMENTATION.md)
- [Phase 1 Report](PHASE_1_REPORT.md)
- [Phase 2 Report](PHASE_2_REPORT.md)
- [Phase 3 Report](PHASE_3_REPORT.md)
- [Final Hackathon Report](FINAL_REPORT.md)
