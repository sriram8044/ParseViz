# ParseViz REST API Specification (Phase 2)

Base URL: `http://127.0.0.1:8000/api`

---

## 1. POST `/grammar/parse`
Parses CFG text into tokenized production rules, non-terminals, terminals, and structural models.

### Request Body:
```json
{
  "grammar": "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id",
  "start_symbol": "E"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "start_symbol": "E",
  "non_terminals": ["E", "T", "F"],
  "terminals": ["(", ")", "*", "+", "id"],
  "productions": [
    {
      "head": "E",
      "alternatives": [
        {
          "symbols": [
            { "name": "E", "type": "NON_TERMINAL", "is_quoted": false },
            { "name": "+", "type": "TERMINAL", "is_quoted": false },
            { "name": "T", "type": "NON_TERMINAL", "is_quoted": false }
          ],
          "representation": "E + T",
          "rule_index": 1,
          "line_number": 1,
          "is_epsilon": false
        },
        {
          "symbols": [
            { "name": "T", "type": "NON_TERMINAL", "is_quoted": false }
          ],
          "representation": "T",
          "rule_index": 2,
          "line_number": 1,
          "is_epsilon": false
        }
      ],
      "raw_rule": "E -> E + T | T"
    }
  ],
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "info": [
      {
        "level": "info",
        "message": "Grammar successfully validated with 3 non-terminals, 5 terminals, and 6 total alternatives.",
        "symbol": null,
        "line": null,
        "column": null
      }
    ]
  },
  "statistics": {
    "production_count": 3,
    "alternative_count": 6,
    "epsilon_non_terminals": [],
    "direct_left_recursive": ["E", "T"],
    "direct_right_recursive": []
  },
  "error": null
}
```

---

## 2. POST `/grammar/validate`
Performs fast syntactic and semantic validation without building the full symbol analysis.

### Request Body:
```json
{
  "grammar": "S -> A B\nA -> a",
  "start_symbol": "S"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "start_symbol": "S",
  "validation": {
    "valid": false,
    "errors": [
      {
        "level": "error",
        "message": "Non-terminal 'B' is referenced in production bodies but has no production rules defined.",
        "symbol": "B",
        "line": null,
        "column": null
      }
    ],
    "warnings": [],
    "info": []
  },
  "error": null
}
```

---

## 3. POST `/grammar/analyze`
Computes detailed CFG structural analysis, direct recursion, nullable non-terminals, and rule inventories.

---

## 4. GET `/grammar/examples`
Returns a catalog of 7 working example CFG grammars across categories (Classic Arithmetic, If-Else, LL(1)-Ready with Epsilon, Balanced Parentheses, Direct Left Recursion, etc.).

---

## 5. GET `/health`
Health check endpoint reporting API version and engine operational status.

