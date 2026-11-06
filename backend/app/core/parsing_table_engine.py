from typing import Dict, List, Set, Tuple, Any, Optional
from app.core.grammar_symbols import GrammarSymbol, SymbolType, EPSILON_SYMBOL
from app.core.grammar_model import Grammar, ProductionAlternative
from app.core.first_follow_engine import FirstFollowEngine


class ParsingTableEngine:
    """
    Constructs deterministic LL(1) Parsing Table M[A, a].
    Detects FIRST/FIRST and FIRST/FOLLOW conflicts with detailed diagnostics.
    """

    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.ff_engine = FirstFollowEngine(grammar)
        self.first_sets = self.ff_engine.compute_first()
        self.follow_sets = self.ff_engine.compute_follow()
        # Columns include all terminals + endmarker '$'
        self.terminals = sorted(list(grammar.terminals)) + ["$"]
        self.non_terminals = [nt for nt in grammar.rules_order if nt in grammar.non_terminals]

    def build_table(self) -> Dict[str, Any]:
        # table structure: { A: { a: [list of production rules] } }
        table: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
            nt: {t: [] for t in self.terminals} for nt in self.non_terminals
        }
        conflicts: List[Dict[str, Any]] = []

        for head, alts in self.grammar.productions.items():
            if head not in table:
                continue

            for alt in alts:
                # Find FIRST(alt.symbols)
                alt_first = self.ff_engine.first_of_sequence(alt.symbols)

                rule_repr = f"{head} -> {alt}"
                entry = {
                    "head": head,
                    "representation": rule_repr,
                    "symbols": [s.to_dict() for s in alt.symbols],
                    "rule_index": alt.rule_index,
                    "is_epsilon": alt.is_epsilon,
                }

                # Rule 1: For each terminal a in FIRST(alpha), add A -> alpha to M[A, a]
                for a in alt_first:
                    if a != "ε" and a in table[head]:
                        table[head][a].append(entry)

                # Rule 2: If ε in FIRST(alpha), for each terminal b in FOLLOW(A), add A -> alpha to M[A, b]
                if "ε" in alt_first:
                    for b in self.follow_sets.get(head, set()):
                        if b in table[head]:
                            # Don't add duplicate if already added
                            if entry not in table[head][b]:
                                table[head][b].append(entry)

        # Detect conflicts
        first_first_conflicts = 0
        first_follow_conflicts = 0

        for nt in self.non_terminals:
            for t in self.terminals:
                entries = table[nt][t]
                if len(entries) > 1:
                    has_eps = any(e["is_epsilon"] for e in entries)
                    c_type = "FIRST/FOLLOW" if has_eps else "FIRST/FIRST"
                    if c_type == "FIRST/FIRST":
                        first_first_conflicts += 1
                    else:
                        first_follow_conflicts += 1

                    conflicts.append({
                        "non_terminal": nt,
                        "terminal": t,
                        "conflict_type": c_type,
                        "rules": [e["representation"] for e in entries],
                        "explanation": f"Multiple entries found for M[{nt}, '{t}']: {', '.join(e['representation'] for e in entries)} ({c_type} conflict)."
                    })

        is_ll1 = len(conflicts) == 0

        return {
            "is_ll1": is_ll1,
            "non_terminals": self.non_terminals,
            "terminals": self.terminals,
            "table": table,
            "conflicts": conflicts,
            "statistics": {
                "total_cells": len(self.non_terminals) * len(self.terminals),
                "conflict_cells_count": len(conflicts),
                "first_first_conflicts": first_first_conflicts,
                "first_follow_conflicts": first_follow_conflicts,
            }
        }

