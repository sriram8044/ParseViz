# ParseViz — Final Project Quality Assurance & Hackathon Report

**Project Name:** ParseViz  
**Category:** Advanced Interactive Compiler Design Platform  
**Target Milestone:** Final Hackathon Demonstration  
**Environment:** Windows 11 (Python 3.11.9, Node.js v22.21.0, npm 10.9.4)  
**Execution Date:** 2026-10-30  

---

## 1. Executive Summary

ParseViz has reached full hackathon readiness. The entire pipeline from raw Context-Free Grammar (CFG) text parsing, left-recursion elimination, left-factoring, fixed-point FIRST/FOLLOW calculation, LL(1) matrix generation with conflict detection, pushdown automata simulation, to D3.js parse tree rendering is complete, verified, and backed by automated tests.

---

## 2. Verification of Complete End-to-End Workflow

The canonical compiler workflow was verified on the classic left-recursive arithmetic grammar:
```
E -> E + T | T
T -> T * F | F
F -> ( E ) | id
```
Using test string:
```
id + id * id
```

### Verified Workflow Steps:
1. **Grammar Editor:** Tokenizes symbols into non-terminals $\{E, T, F\}$ and terminals $\{+, *, (, ), id\}$.
2. **Left Recursion Elimination:** Replaces direct left recursion introducing primes $E', T'$ and $\varepsilon$.
3. **Left Factoring:** Factors common prefixes using longest common prefix analysis.
4. **FIRST & FOLLOW Sets:** Computes fixed-point sets:
   - $\text{FIRST}(E) = \{(, id\}$
   - $\text{FIRST}(E') = \{+, \varepsilon\}$
   - $\text{FOLLOW}(E) = \{\$, )\}$
5. **LL(1) Table Generation:** Generates deterministic $M[A, a]$ matrix with 0 conflicts.
6. **Predictive Parsing Simulator:** Executes pushdown automata matching tokens against lookaheads in 17 steps with status `ACCEPTED`.
7. **Parse Tree Visualizer:** Constructs the syntax tree and renders hierarchical bezier links via D3.js with zoom/pan and SVG export.

---

## 3. Edge Cases & Robustness Verification

The following edge cases were implemented as automated unit tests and verified:
- **Empty & Whitespace Grammars:** Properly rejects with informative lexical errors.
- **Missing Production Arrows & Unterminated Quotes:** Reports precise line and column numbers.
- **Empty Alternative Detection:** Detects trailing pipes (`|`) or empty bodies without guessing.
- **Epsilon Combined with Other Symbols:** Rejects malformed epsilon combinations ($A \to \varepsilon B$).
- **Direct & Indirect Self-Recursion:** Handles multi-branch direct left recursion without infinite loops.
- **Non-LL(1) Ambiguity & Conflicts:** Reports FIRST/FIRST and FIRST/FOLLOW conflicts cell-by-cell.
- **Empty String Inputs:** Correctly accepted if start symbol derives epsilon.
- **Nested Expressions:** Deeply nested parentheses `( ( id ) )` successfully parsed and verified.
- **Syntax Errors in Inputs:** Halts with informative mismatched token errors.

---

## 4. Test Suite Summary

- **Total Backend Pytest Tests:** **35 tests**
- **Test Results:** **35 passed, 0 failed** in `0.65s`
  - `tests/test_end_to_end_and_edge_cases.py`: 2 passed (E2E workflow & edge cases)
  - `tests/test_compiler_algorithms.py`: 6 passed (Left recursion, factoring, FIRST/FOLLOW, LL(1) table, simulator)
  - `tests/test_grammar_api.py`: 4 passed (API endpoints)
  - `tests/test_grammar_parser.py`: 7 passed (Grammar parsing & validation)
  - `tests/test_grammar_symbols.py`: 3 passed (Symbol & recursion analysis)
  - `tests/test_grammar_tokenizer.py`: 5 passed (Lexer, quotes, comments)
  - `tests/test_grammar_validator.py`: 5 passed (Semantic checks)
  - `tests/test_health.py`: 3 passed (Health & CORS)
- **Frontend TypeScript Build:** Clean with `tsc -b && vite build` (zero errors, 1.41s).

---

## 5. Demonstration Mode

A live guided demonstration mode has been integrated directly into **Learning Mode** (`/learning-mode`):
- Click **"Launch Demonstration"** to execute the end-to-end arithmetic workflow.
- Step through stages 1 to 5 to observe how the real engine transforms grammar, computes sets, builds tables, and executes parse trees.

---

## 6. How to Run for Hackathon Presentation

### 1. Start Backend API Server
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Health: `http://127.0.0.1:8000/api/health`
- Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Start Frontend UI
```powershell
cd frontend
npm run dev
```
- Open Browser: [http://localhost:5173](http://localhost:5173)

