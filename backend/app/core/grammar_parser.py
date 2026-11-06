from typing import List, Dict, Set, Optional, Tuple
from app.core.grammar_tokenizer import GrammarTokenizer, Token, TokenType
from app.core.grammar_symbols import GrammarSymbol, SymbolType, EPSILON_SYMBOL
from app.core.grammar_model import Grammar, ProductionAlternative
from app.core.exceptions import ParsingException, LexicalException


class GrammarParser:
    """
    Parses token stream into a validated, structured Grammar object.
    Preserves rule ordering, alternatives, and line numbers.
    """

    def __init__(self, text: str, user_start_symbol: Optional[str] = None):
        self.text = text
        self.user_start_symbol = user_start_symbol.strip() if user_start_symbol else None
        self.tokenizer = GrammarTokenizer(text)
        self.tokens: List[Token] = []
        self.cursor = 0

    def _peek(self) -> Token:
        if self.cursor < len(self.tokens):
            return self.tokens[self.cursor]
        return self.tokens[-1] # EOF

    def _advance(self) -> Token:
        tok = self._peek()
        if self.cursor < len(self.tokens):
            self.cursor += 1
        return tok

    def _skip_newlines(self):
        while self._peek().type == TokenType.NEWLINE:
            self._advance()

    def parse(self) -> Grammar:
        self.tokens = self.tokenizer.tokenize()
        self.cursor = 0

        self._skip_newlines()

        if self._peek().type == TokenType.EOF:
            raise ParsingException("Grammar input is empty. Please provide at least one production rule.", line=1, column=1)

        productions: Dict[str, List[ProductionAlternative]] = {}
        rules_order: List[str] = []
        all_non_terminals: Set[str] = set()
        all_terminals: Set[str] = set()
        global_rule_counter = 0

        while self._peek().type != TokenType.EOF:
            self._skip_newlines()
            if self._peek().type == TokenType.EOF:
                break

            head_token = self._peek()
            if head_token.type != TokenType.NON_TERMINAL:
                raise ParsingException(
                    f"Expected non-terminal (uppercase identifier) on left-hand side of production, got '{head_token.value}'.",
                    line=head_token.line,
                    column=head_token.column,
                )

            head_name = self._advance().value
            all_non_terminals.add(head_name)
            if head_name not in rules_order:
                rules_order.append(head_name)

            # Expect ARROW
            arrow_token = self._peek()
            if arrow_token.type != TokenType.ARROW:
                raise ParsingException(
                    f"Expected production arrow '->' or '::=' after head symbol '{head_name}', got '{arrow_token.value or arrow_token.type.name}'.",
                    line=arrow_token.line,
                    column=arrow_token.column,
                )
            self._advance() # consume arrow

            if head_name not in productions:
                productions[head_name] = []

            # Parse right-hand side alternatives separated by '|'
            # A production line ends at NEWLINE or EOF
            while True:
                # Parse one alternative
                alt_symbols: List[GrammarSymbol] = []
                alt_start_line = self._peek().line

                while self._peek().type not in (TokenType.PIPE, TokenType.NEWLINE, TokenType.EOF):
                    curr = self._advance()
                    if curr.type == TokenType.NON_TERMINAL:
                        alt_symbols.append(GrammarSymbol(name=curr.value, symbol_type=SymbolType.NON_TERMINAL))
                        # Could be non-terminal referenced
                        all_non_terminals.add(curr.value)
                    elif curr.type == TokenType.TERMINAL_ID:
                        alt_symbols.append(GrammarSymbol(name=curr.value, symbol_type=SymbolType.TERMINAL))
                        all_terminals.add(curr.value)
                    elif curr.type == TokenType.QUOTED_TERMINAL:
                        alt_symbols.append(GrammarSymbol(name=curr.value, symbol_type=SymbolType.TERMINAL, is_quoted=True))
                        all_terminals.add(curr.value)
                    elif curr.type == TokenType.PUNCTUATION:
                        alt_symbols.append(GrammarSymbol(name=curr.value, symbol_type=SymbolType.TERMINAL))
                        all_terminals.add(curr.value)
                    elif curr.type == TokenType.EPSILON:
                        alt_symbols.append(EPSILON_SYMBOL)
                    else:
                        raise ParsingException(
                            f"Unexpected token '{curr.value}' in production body.",
                            line=curr.line,
                            column=curr.column,
                        )

                # Validate alternative
                if not alt_symbols:
                    raise ParsingException(
                        f"Empty alternative encountered in production for '{head_name}'. Use 'ε' or 'epsilon' to represent an empty production.",
                        line=alt_start_line,
                        column=self._peek().column,
                    )

                # Check multiple symbols when epsilon is present
                if len(alt_symbols) > 1 and any(s.is_epsilon for s in alt_symbols):
                    raise ParsingException(
                        f"Epsilon cannot be combined with other symbols in alternative for '{head_name}'.",
                        line=alt_start_line,
                        column=self._peek().column,
                    )

                global_rule_counter += 1
                productions[head_name].append(
                    ProductionAlternative(
                        symbols=tuple(alt_symbols),
                        rule_index=global_rule_counter,
                        line_number=alt_start_line,
                    )
                )

                # Check if next is PIPE or end of line
                if self._peek().type == TokenType.PIPE:
                    pipe_tok = self._advance() # consume '|'
                    # If followed immediately by newline or EOF, that's a trailing empty alternative
                    if self._peek().type in (TokenType.NEWLINE, TokenType.EOF):
                        raise ParsingException(
                            f"Trailing '|' with no following alternative in production for '{head_name}'. Use 'ε' for epsilon.",
                            line=pipe_tok.line,
                            column=pipe_tok.column,
                        )
                    continue
                else:
                    # End of this production line
                    break

            self._skip_newlines()

        # Determine start symbol
        if self.user_start_symbol:
            start_symbol = self.user_start_symbol
        else:
            start_symbol = rules_order[0] if rules_order else "S"

        # Separate defined non-terminals (heads)
        defined_heads = set(productions.keys())
        # Any symbol previously seen as non-terminal but without production is still a referenced non-terminal
        # Terminals should exclude any symbol that is actually a defined non-terminal
        terminals_clean = {t for t in all_terminals if t not in all_non_terminals}

        return Grammar(
            start_symbol=start_symbol,
            non_terminals=all_non_terminals,
            terminals=terminals_clean,
            productions=productions,
            original_text=self.text,
            rules_order=rules_order,
        )

