# ParseViz Project Structure

```
cd hackthon/
├── README.md
├── PROJECT_STRUCTURE.md
├── PHASE_1_REPORT.md
│
├── backend/
│   ├── venv/                         # Python virtual environment
│   ├── requirements.txt              # Backend dependencies (FastAPI, Uvicorn, Pydantic, etc.)
│   ├── pytest.ini                    # Pytest test discovery and path configuration
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_health.py            # API health, CORS preflight and schema tests
│   └── app/
│       ├── __init__.py
│       ├── main.py                   # FastAPI main entrypoint, CORS middleware & route registration
│       ├── api/
│       │   ├── __init__.py
│       │   └── endpoints.py          # /api/health and route endpoints
│       ├── core/
│       │   ├── __init__.py
│       │   └── config.py             # Settings, CORS origins and environment configuration
│       ├── database/
│       │   └── __init__.py           # SQLite database connection helpers
│       ├── models/
│       │   └── __init__.py           # Database and domain models
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── health.py             # Pydantic v2 schemas for health status
│       └── services/
│           └── __init__.py           # Parser algorithms & service logic (subsequent phases)
│
└── frontend/
    ├── index.html                    # Root HTML document
    ├── package.json                  # Dependencies (React 19, Vite, Tailwind v4, Lucide, Axios)
    ├── vite.config.ts                # Vite config with Tailwind CSS v4 plugin
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── public/
    └── src/
        ├── index.css                 # Tailwind CSS v4 imports, dark developer theme variables
        ├── main.tsx                  # React entry point
        ├── App.tsx                   # React Router route registry for all 11 modules
        ├── types/
        │   └── index.ts              # Core TypeScript interfaces (HealthStatus, GrammarTemplate, etc.)
        ├── services/
        │   └── api.ts                # Axios client with base URL and health check service
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.tsx     # Application shell with responsive sidebar & navbar
        │   │   ├── Sidebar.tsx       # Collapsible navigation sidebar with Lucide icons
        │   │   └── Navbar.tsx        # Top status bar with live backend health indicator
        │   └── common/
        │       ├── MetricCard.tsx    # Dark card component for metrics and counters
        │       ├── ModuleCard.tsx    # Interactive launchpad cards for compiler modules
        │       ├── PageHeader.tsx    # Unified header component across views
        │       └── PlaceholderView.tsx # Architecture placeholder for future phases
        └── pages/
            ├── Dashboard.tsx         # Executive compiler dashboard with stats & templates
            ├── GrammarEditor.tsx     # CFG editor with token parsing preview
            ├── TransformationStudio.tsx # Left-recursion & Left-factoring studio
            ├── FirstFollow.tsx       # FIRST & FOLLOW derivation sets
            ├── LL1Table.tsx          # LL(1) predictive table & conflict inspection
            ├── ParsingSimulator.tsx  # Step-by-step automata stack & token buffer simulator
            ├── ParseTreeVisualizer.tsx # D3.js and React Flow tree rendering
            ├── GrammarPlayground.tsx # Rapid prototyping playground
            ├── LearningMode.tsx      # Compiler pedagogy & tutorial walkthroughs
            ├── ComparisonAnalysis.tsx # Grammar benchmarking & side-by-side diffs
            └── SettingsPage.tsx      # System health, SQLite and API configurations
```

