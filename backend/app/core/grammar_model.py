from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional, Tuple
from app.core.grammar_symbols import GrammarSymbol, SymbolType, EPSILON_SYMBOL
from app.core.exceptions import ParsingException


@dataclass
class ProductionAlternative:
    symbols: Tuple[GrammarSymbol, ...]
    rule_index: int
    line_number: int

    @property
    def is_epsilon(self) -> bool:
        return len(self.symbols) == 1 and self.symbols[0].is_epsilon

    def __str__(self) -> str:
        if self.is_epsilon:
            return "ε"
        return " ".join(str(s) for s in self.symbols)

    def to_dict(self):
        return {
            "symbols": [s.to_dict() for s in self.symbols],
            "representation": str(self),
            "rule_index": self.rule_index,
            "line_number": self.line_number,
            "is_epsilon": self.is_epsilon,
        }


@dataclass
class ProductionRule:
    head: GrammarSymbol
    alternatives: List[ProductionAlternative] = field(default_factory=list)

    def to_dict(self):
        return {
            "head": self.head.name,
            "alternatives": [alt.to_dict() for alt in self.alternatives],
        }


@dataclass
class Grammar:
    start_symbol: str
    non_terminals: Set[str]
    terminals: Set[str]
    productions: Dict[str, List[ProductionAlternative]] # Head name -> list of alternatives
    original_text: str
    rules_order: List[str] # Ordered unique non-terminals by appearance

    def get_symbols(self) -> Set[str]:
        return self.non_terminals | self.terminals

    def get_alternatives(self, head: str) -> List[ProductionAlternative]:
        return self.productions.get(head, [])

    @property
    def total_alternatives_count(self) -> int:
        return sum(len(alts) for alts in self.productions.values())

    @property
    def total_rules_count(self) -> int:
        return len(self.productions)

