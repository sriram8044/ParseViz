from dataclasses import dataclass
from typing import Dict, List, Set
from app.core.grammar_model import Grammar


@dataclass
class SymbolAnalysis:
    start_symbol: str
    non_terminals: List[str]
    terminals: List[str]
    production_count: int
    alternative_count: int
    epsilon_non_terminals: List[str]
    direct_left_recursive: List[str]
    direct_right_recursive: List[str]

    def to_dict(self):
        return {
            "start_symbol": self.start_symbol,
            "non_terminals": self.non_terminals,
            "terminals": self.terminals,
            "production_count": self.production_count,
            "alternative_count": self.alternative_count,
            "epsilon_non_terminals": self.epsilon_non_terminals,
            "direct_left_recursive": self.direct_left_recursive,
            "direct_right_recursive": self.direct_right_recursive,
        }


class GrammarSymbolAnalyzer:
    """
    Performs analytical inspection on grammar structures:
    - Identifies non-terminals & terminals
    - Identifies epsilon-producing non-terminals
    - Identifies immediate left and right recursion
    - Produces statistical summaries
    """

    def __init__(self, grammar: Grammar):
        self.grammar = grammar

    def analyze(self) -> SymbolAnalysis:
        epsilon_nts: Set[str] = set()
        left_rec_nts: Set[str] = set()
        right_rec_nts: Set[str] = set()

        for head, alts in self.grammar.productions.items():
            for alt in alts:
                # Epsilon production: A -> ε
                if alt.is_epsilon:
                    epsilon_nts.add(head)

                # Direct Left Recursion: A -> A alpha
                if alt.symbols and alt.symbols[0].name == head:
                    left_rec_nts.add(head)

                # Direct Right Recursion: A -> alpha A
                if alt.symbols and alt.symbols[-1].name == head:
                    right_rec_nts.add(head)

        # Deterministic sorting for UI presentation
        ordered_nts = [nt for nt in self.grammar.rules_order if nt in self.grammar.non_terminals]
        for nt in sorted(self.grammar.non_terminals):
            if nt not in ordered_nts:
                ordered_nts.append(nt)

        sorted_terminals = sorted(list(self.grammar.terminals))

        return SymbolAnalysis(
            start_symbol=self.grammar.start_symbol,
            non_terminals=ordered_nts,
            terminals=sorted_terminals,
            production_count=self.grammar.total_rules_count,
            alternative_count=self.grammar.total_alternatives_count,
            epsilon_non_terminals=sorted(list(epsilon_nts)),
            direct_left_recursive=sorted(list(left_rec_nts)),
            direct_right_recursive=sorted(list(right_rec_nts)),
        )

