# ParseViz Grammar Notation & Lexical Specification

ParseViz implements an unambiguous, deterministic lexical convention for Context-Free Grammars (CFGs).

---

## 1. Symbol Lexical Conventions

### Non-Terminals ($V_N$)
- Must begin with an uppercase English character (`A-Z`).
- Can include alphanumeric characters, underscores (`_`), and prime marks (`'`).
- **Examples:**
  - `E`, `T`, `F`
  - `Expr`, `Term`, `Factor`
  - `E'`, `T'`, `Expr_1`

### Terminals ($V_T$)
- **Identifiers:** Lowercase-leading identifiers such as `id`, `num`, `int`, `print`, `var`.
- **Punctuation & Operators:** Single character operators and delimiters:
  - `+`, `-`, `*`, `/`, `=`, `(`, `)`, `[`, `]`, `{`, `}`, `;`, `,`, `.`, `<`, `>`, `!`, `&`, `|`, `^`, `%`, `~`, `$`, `#`, `@`, `?`, `:`
- **Quoted Terminals:** Enclosed in single (`'...'`) or double (`"..."`) quotes for disambiguation or multi-character symbols.
  - **Examples:** `'=='`, `':='`, `'!='`, `";"`
- **Digits & Numbers:** Numeric constants such as `0`, `1`, `42` are parsed as terminals.

### Epsilon Productions ($\varepsilon$)
- Epsilon represents an empty derivation ($A \to \varepsilon$).
- Supported representations:
  - Unicode character: `ε` or `ϵ`
  - Keywords: `epsilon` or `eps`
- **Rule:** Epsilon cannot be combined with other symbols within the same alternative (e.g. `A -> ε b` is rejected).

---

## 2. Production Rules Syntax

A Context-Free Grammar is composed of production rules of the form:
```
Head -> Alternative_1 | Alternative_2 | ... | Alternative_n
```

### Head Symbol
- Must be a single valid Non-Terminal on the left-hand side of the production arrow.

### Arrows
- The production assignment arrow can be written as:
  - `->`
  - `::=`
  - `→` (Unicode arrow)

### Alternatives Separator
- Alternatives on the right-hand side are delimited by the pipe character `|`.

### Comments
- **Single-line comments:** Supported via `//` or `#`.
- **Multi-line comments:** Supported via `/* ... */`.

---

## 3. Ambiguity & Lexical Safety

1. **No Silent Guessing:** The lexer and parser strictly validate symbol boundaries and report clear line and column positions upon encountering unexpected tokens or trailing separators.
2. **Empty Alternatives:** Trailing pipes (`A -> a |`) or empty alternatives (`A -> | b`) are rejected; authors must explicitly declare `ε` or `epsilon`.
3. **Start Symbol:** By default, the left-hand side of the first valid production rule is designated as the start symbol $S$. Users may optionally override the start symbol explicitly.

