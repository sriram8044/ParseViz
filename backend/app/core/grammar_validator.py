from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional
from app.core.grammar_model import Grammar


@dataclass
class ValidationIssue:
    level: str # "error", "warning", "info"
    message: str
    symbol: Optional[str] = None
    line: Optional[int] = None
    column: Optional[int] = None

    def to_dict(self):
        return {
            "level": self.level,
            "message": self.message,
            "symbol": self.symbol,
            "line": self.line,
            "column": self.column,
        }


@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[ValidationIssue] = field(default_factory=list)
    warnings: List[ValidationIssue] = field(default_factory=list)
    info: List[ValidationIssue] = field(default_factory=list)

    def to_dict(self):
        return {
            "valid": self.is_valid,
            "errors": [e.to_dict() for e in self.errors],
            "warnings": [w.to_dict() for w in self.warnings],
            "info": [i.to_dict() for i in self.info],
        }


class GrammarValidator:
    """
    Performs comprehensive semantic validation on a parsed Grammar object.
    Distinguishes fatal errors from warnings and informational notices.
    """

    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.errors: List[ValidationIssue] = []
        self.warnings: List[ValidationIssue] = []
        self.info: List[ValidationIssue] = []

    def validate(self) -> ValidationResult:
        self.errors.clear()
        self.warnings.clear()
        self.info.clear()

        # Rule 1: At least one production exists
        if not self.grammar.productions:
            self.errors.append(
                ValidationIssue(
                    level="error",
                    message="Grammar has no production rules.",
                    line=1,
                )
            )
            return ValidationResult(is_valid=False, errors=self.errors)

        # Rule 2: Start symbol exists in the grammar productions
        if self.grammar.start_symbol not in self.grammar.productions:
            self.errors.append(
                ValidationIssue(
                    level="error",
                    message=f"Start symbol '{self.grammar.start_symbol}' has no defined production rules in the grammar.",
                    symbol=self.grammar.start_symbol,
                    line=1,
                )
            )

        # Rule 3: Every referenced non-terminal has at least one production rule
        defined_heads = set(self.grammar.productions.keys())
        for nt in self.grammar.non_terminals:
            if nt not in defined_heads:
                self.errors.append(
                    ValidationIssue(
                        level="error",
                        message=f"Non-terminal '{nt}' is referenced in production bodies but has no production rules defined.",
                        symbol=nt,
                    )
                )

        # Rule 4: Check duplicate alternatives for the same Non-Terminal
        for head, alts in self.grammar.productions.items():
            seen_alt_reps: Set[str] = set()
            for alt in alts:
                alt_str = str(alt)
                if alt_str in seen_alt_reps:
                    self.warnings.append(
                        ValidationIssue(
                            level="warning",
                            message=f"Duplicate alternative '{head} -> {alt_str}' detected.",
                            symbol=head,
                            line=alt.line_number,
                        )
                    )
                else:
                    seen_alt_reps.add(alt_str)

        # Rule 5: Check unreachable non-terminals from start symbol (Warning)
        reachable: Set[str] = set()
        if self.grammar.start_symbol in defined_heads:
            queue = [self.grammar.start_symbol]
            reachable.add(self.grammar.start_symbol)
            while queue:
                curr = queue.pop(0)
                for alt in self.grammar.get_alternatives(curr):
                    for sym in alt.symbols:
                        if sym.is_non_terminal and sym.name not in reachable:
                            reachable.add(sym.name)
                            queue.append(sym.name)

            unreachable = defined_heads - reachable
            for u in unreachable:
                self.warnings.append(
                    ValidationIssue(
                        level="warning",
                        message=f"Non-terminal '{u}' is unreachable from start symbol '{self.grammar.start_symbol}'.",
                        symbol=u,
                    )
                )

        # Rule 6: Check for cycles (e.g. A -> A single symbol unit cycle)
        for head, alts in self.grammar.productions.items():
            for alt in alts:
                if len(alt.symbols) == 1 and alt.symbols[0].name == head:
                    self.warnings.append(
                        ValidationIssue(
                            level="warning",
                            message=f"Trivial single-symbol cycle '{head} -> {head}' will cause infinite loops in top-down parsing.",
                            symbol=head,
                            line=alt.line_number,
                        )
                    )

        # Info: Total symbol count
        self.info.append(
            ValidationIssue(
                level="info",
                message=f"Grammar successfully validated with {len(self.grammar.non_terminals)} non-terminals, {len(self.grammar.terminals)} terminals, and {self.grammar.total_alternatives_count} total alternatives.",
            )
        )

        is_valid = len(self.errors) == 0
        return ValidationResult(
            is_valid=is_valid,
            errors=self.errors,
            warnings=self.warnings,
            info=self.info,
        )

