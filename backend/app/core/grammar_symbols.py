from enum import Enum
from dataclasses import dataclass
from typing import Optional


class SymbolType(Enum):
    NON_TERMINAL = "NON_TERMINAL"
    TERMINAL = "TERMINAL"
    EPSILON = "EPSILON"


@dataclass(frozen=True)
class GrammarSymbol:
    name: str
    symbol_type: SymbolType
    is_quoted: bool = False

    @property
    def is_non_terminal(self) -> bool:
        return self.symbol_type == SymbolType.NON_TERMINAL

    @property
    def is_terminal(self) -> bool:
        return self.symbol_type == SymbolType.TERMINAL

    @property
    def is_epsilon(self) -> bool:
        return self.symbol_type == SymbolType.EPSILON

    def __str__(self) -> str:
        if self.is_epsilon:
            return "ε"
        if self.is_quoted:
            return f"'{self.name}'"
        return self.name

    def to_dict(self):
        return {
            "name": self.name,
            "type": self.symbol_type.value,
            "is_quoted": self.is_quoted,
        }


# Canonical representation of epsilon
EPSILON_SYMBOL = GrammarSymbol(name="ε", symbol_type=SymbolType.EPSILON)

