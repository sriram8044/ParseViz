from enum import Enum
from dataclasses import dataclass
from typing import List
import re
from app.core.exceptions import LexicalException


class TokenType(Enum):
    NON_TERMINAL = "NON_TERMINAL"
    TERMINAL_ID = "TERMINAL_ID"
    QUOTED_TERMINAL = "QUOTED_TERMINAL"
    PUNCTUATION = "PUNCTUATION"
    ARROW = "ARROW"
    PIPE = "PIPE"
    EPSILON = "EPSILON"
    NEWLINE = "NEWLINE"
    EOF = "EOF"


@dataclass
class Token:
    type: TokenType
    value: str
    line: int
    column: int

    def __str__(self) -> str:
        return f"Token({self.type.name}, '{self.value}', {self.line}:{self.column})"


class GrammarTokenizer:
    """
    Lexer for Context-Free Grammars.
    Tokenizes input strings into grammar symbols with strict line and column tracking.
    """

    PUNCTUATION_CHARS = set("+-*/=()[]{};,.<>!&|^%~$#@?:")

    def __init__(self, text: str):
        self.text = text
        self.length = len(text)
        self.pos = 0
        self.line = 1
        self.column = 1

    def _peek(self) -> str:
        if self.pos < self.length:
            return self.text[self.pos]
        return ""

    def _peek_next(self) -> str:
        if self.pos + 1 < self.length:
            return self.text[self.pos + 1]
        return ""

    def _advance(self) -> str:
        if self.pos < self.length:
            ch = self.text[self.pos]
            self.pos += 1
            if ch == "\n":
                self.line += 1
                self.column = 1
            else:
                self.column += 1
            return ch
        return ""

    def tokenize(self) -> List[Token]:
        tokens: List[Token] = []

        while self.pos < self.length:
            ch = self._peek()

            # Handle comments: // or # or /* ... */
            if ch == "#" or (ch == "/" and self._peek_next() == "/"):
                while self.pos < self.length and self._peek() != "\n":
                    self._advance()
                continue

            if ch == "/" and self._peek_next() == "*":
                start_line = self.line
                start_col = self.column
                self._advance() # /
                self._advance() # *
                closed = False
                while self.pos < self.length:
                    if self._peek() == "*" and self._peek_next() == "/":
                        self._advance()
                        self._advance()
                        closed = True
                        break
                    self._advance()
                if not closed:
                    raise LexicalException("Unterminated block comment", line=start_line, column=start_col)
                continue

            # Handle whitespace (except newline)
            if ch in " \t\r":
                self._advance()
                continue

            # Handle newlines
            if ch == "\n":
                token_col = self.column
                token_line = self.line
                self._advance()
                # Only append newline if the previous token wasn't already a newline
                if tokens and tokens[-1].type != TokenType.NEWLINE:
                    tokens.append(Token(TokenType.NEWLINE, "\n", token_line, token_col))
                continue

            token_line = self.line
            token_col = self.column

            # Handle Arrow: '->' or '::=' or '→'
            if ch == "→":
                self._advance()
                tokens.append(Token(TokenType.ARROW, "->", token_line, token_col))
                continue

            if ch == "-" and self._peek_next() == ">":
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.ARROW, "->", token_line, token_col))
                continue

            if ch == ":" and self._peek_next() == ":" and self.pos + 2 < self.length and self.text[self.pos + 2] == "=":
                self._advance()
                self._advance()
                self._advance()
                tokens.append(Token(TokenType.ARROW, "->", token_line, token_col))
                continue

            # Handle Pipe: '|'
            if ch == "|":
                self._advance()
                tokens.append(Token(TokenType.PIPE, "|", token_line, token_col))
                continue

            # Handle Epsilon: 'ε' or 'ϵ'
            if ch in ("ε", "ϵ"):
                self._advance()
                tokens.append(Token(TokenType.EPSILON, "ε", token_line, token_col))
                continue

            # Handle Quoted Terminal: '...' or "..."
            if ch in ("'", '"'):
                quote_char = ch
                self._advance()
                val = []
                while self.pos < self.length and self._peek() != quote_char:
                    if self._peek() == "\n":
                        raise LexicalException(f"Unterminated quoted string starting with {quote_char}", line=token_line, column=token_col)
                    val.append(self._advance())

                if self.pos >= self.length or self._peek() != quote_char:
                    raise LexicalException(f"Unterminated quoted string starting with {quote_char}", line=token_line, column=token_col)

                self._advance() # consume closing quote
                token_val = "".join(val)
                if not token_val:
                    raise LexicalException("Empty quoted terminal is not permitted. Use ε for epsilon.", line=token_line, column=token_col)
                tokens.append(Token(TokenType.QUOTED_TERMINAL, token_val, token_line, token_col))
                continue

            # Handle Non-Terminals: Starts with Uppercase [A-Z], followed by alphanumeric, underscores, primes (')
            if ch.isupper():
                val = [self._advance()]
                while self.pos < self.length:
                    nxt = self._peek()
                    if nxt.isalnum() or nxt == "_" or nxt == "'":
                        val.append(self._advance())
                    else:
                        break
                name = "".join(val)
                tokens.append(Token(TokenType.NON_TERMINAL, name, token_line, token_col))
                continue

            # Handle Terminals: lowercase identifiers, keywords, or 'epsilon'/'eps'
            if ch.islower():
                val = [self._advance()]
                while self.pos < self.length:
                    nxt = self._peek()
                    if nxt.isalnum() or nxt == "_":
                        val.append(self._advance())
                    else:
                        break
                name = "".join(val)
                if name.lower() in ("epsilon", "eps"):
                    tokens.append(Token(TokenType.EPSILON, "ε", token_line, token_col))
                else:
                    tokens.append(Token(TokenType.TERMINAL_ID, name, token_line, token_col))
                continue

            # Handle Punctuation terminals
            if ch in self.PUNCTUATION_CHARS:
                # Disambiguate if single char or two char (e.g. '==' or '!=')
                punct = self._advance()
                tokens.append(Token(TokenType.PUNCTUATION, punct, token_line, token_col))
                continue

            # Handle digits as terminals (e.g. numbers)
            if ch.isdigit():
                val = [self._advance()]
                while self.pos < self.length and self._peek().isdigit():
                    val.append(self._advance())
                tokens.append(Token(TokenType.TERMINAL_ID, "".join(val), token_line, token_col))
                continue

            # Unexpected character
            invalid_ch = self._advance()
            raise LexicalException(
                f"Unexpected character '{invalid_ch}' in grammar input.",
                line=token_line,
                column=token_col,
            )

        tokens.append(Token(TokenType.EOF, "", self.line, self.column))
        return tokens

