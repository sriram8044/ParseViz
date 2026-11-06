from typing import Dict, Set, List, Tuple, Any
from app.core.grammar_symbols import GrammarSymbol, SymbolType, EPSILON_SYMBOL
from app.core.grammar_model import Grammar, ProductionAlternative


class FirstFollowEngine:
    """
    Computes FIRST and FOLLOW sets using standard fixed-point iteration,
    including nullable non-terminals and detailed step-by-step reasoning.
    """

    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.non_terminals = set(grammar.non_terminals)
        self.terminals = set(grammar.terminals)
        self.nullable: Set[str] = set()
        self.first_sets: Dict[str, Set[str]] = {}
        self.follow_sets: Dict[str, Set[str]] = {}
        self.first_explanations: Dict[str, List[str]] = {}
        self.follow_explanations: Dict[str, List[str]] = {}
        self.iterations_history: List[Dict[str, Any]] = []

    def compute_nullable(self) -> Set[str]:
        """
        Calculates all nullable non-terminals:
        A -> ε  => A is nullable
        A -> B_1 ... B_k where all B_i are nullable => A is nullable
        """
        nullable = set()
        changed = True
        while changed:
            changed = False
            for head, alts in self.grammar.productions.items():
                if head in nullable:
                    continue
                for alt in alts:
                    if alt.is_epsilon:
                        nullable.add(head)
                        changed = True
                        break
                    elif alt.symbols and all(s.name in nullable for s in alt.symbols):
                        nullable.add(head)
                        changed = True
                        break
        self.nullable = nullable
        return nullable

    def compute_first(self) -> Dict[str, Set[str]]:
        """
        Computes FIRST sets for all non-terminals and terminals.
        Fixed-point iteration.
        """
        self.compute_nullable()
        first: Dict[str, Set[str]] = {}
        explanations: Dict[str, List[str]] = {}

        # 1. Terminals: FIRST(a) = {a}
        for t in self.terminals:
            first[t] = {t}
            explanations[t] = [f"Base terminal rule: FIRST('{t}') = {{'{t}'}}"]

        # 2. Non-terminals: init empty
        for nt in self.non_terminals:
            first[nt] = set()
            explanations[nt] = []

        # Fixed point iteration
        changed = True
        iteration_count = 0
        while changed:
            changed = False
            iteration_count += 1
            for head, alts in self.grammar.productions.items():
                for alt in alts:
                    if alt.is_epsilon:
                        if "ε" not in first[head]:
                            first[head].add("ε")
                            explanations[head].append(f"Added ε due to production {head} -> ε")
                            changed = True
                        continue

                    # Alternative: Y_1 Y_2 ... Y_k
                    all_nullable = True
                    for sym in alt.symbols:
                        sym_name = sym.name
                        if sym.is_terminal:
                            if sym_name not in first[head]:
                                first[head].add(sym_name)
                                explanations[head].append(
                                    f"Added '{sym_name}' from terminal prefix in {head} -> {alt}"
                                )
                                changed = True
                            all_nullable = False
                            break
                        else:
                            # Non-terminal
                            sym_first = first.get(sym_name, set())
                            for f_sym in sym_first:
                                if f_sym != "ε" and f_sym not in first[head]:
                                    first[head].add(f_sym)
                                    explanations[head].append(
                                        f"Added '{f_sym}' from FIRST({sym_name}) via {head} -> {alt}"
                                    )
                                    changed = True

                            if sym_name not in self.nullable:
                                all_nullable = False
                                break

                    if all_nullable:
                        if "ε" not in first[head]:
                            first[head].add("ε")
                            explanations[head].append(
                                f"Added ε because all symbols in {head} -> {alt} are nullable"
                            )
                            changed = True

        self.first_sets = first
        self.first_explanations = explanations
        return first

    def first_of_sequence(self, symbols: Tuple[GrammarSymbol, ...]) -> Set[str]:
        """Calculates FIRST set of a sequence of grammar symbols alpha."""
        if not symbols:
            return {"ε"}

        result = set()
        all_nullable = True

        for sym in symbols:
            if sym.is_epsilon:
                continue
            if sym.is_terminal:
                result.add(sym.name)
                all_nullable = False
                break
            else:
                sym_first = self.first_sets.get(sym.name, set())
                result.update(sym_first - {"ε"})
                if sym.name not in self.nullable:
                    all_nullable = False
                    break

        if all_nullable:
            result.add("ε")

        return result

    def compute_follow(self) -> Dict[str, Set[str]]:
        """
        Computes FOLLOW sets for all non-terminals.
        Rule 1: Add '$' to FOLLOW(start_symbol).
        Rule 2: If A -> alpha B beta, everything in FIRST(beta) except ε is in FOLLOW(B).
        Rule 3: If A -> alpha B or A -> alpha B beta where beta is nullable, everything in FOLLOW(A) is in FOLLOW(B).
        """
        if not self.first_sets:
            self.compute_first()

        follow: Dict[str, Set[str]] = {nt: set() for nt in self.non_terminals}
        explanations: Dict[str, List[str]] = {nt: [] for nt in self.non_terminals}

        # Rule 1
        start = self.grammar.start_symbol
        if start in follow:
            follow[start].add("$")
            explanations[start].append(f"Added '$' (input endmarker) because '{start}' is the start symbol")

        changed = True
        while changed:
            changed = False
            for head, alts in self.grammar.productions.items():
                for alt in alts:
                    symbols = alt.symbols
                    n = len(symbols)
                    for i in range(n):
                        B = symbols[i]
                        if not B.is_non_terminal or B.name not in follow:
                            continue

                        # beta is sequence after B
                        beta = symbols[i + 1:]
                        first_beta = self.first_of_sequence(beta)

                        # Rule 2: add FIRST(beta) \ {ε}
                        for b_sym in first_beta - {"ε"}:
                            if b_sym not in follow[B.name]:
                                follow[B.name].add(b_sym)
                                explanations[B.name].append(
                                    f"Added '{b_sym}' from FIRST(suffix) in rule {head} -> {alt}"
                                )
                                changed = True

                        # Rule 3: if beta is nullable or empty, add FOLLOW(head)
                        if "ε" in first_beta:
                            for a_sym in follow.get(head, set()):
                                if a_sym not in follow[B.name]:
                                    follow[B.name].add(a_sym)
                                    explanations[B.name].append(
                                        f"Added '{a_sym}' from FOLLOW({head}) because suffix derives ε in {head} -> {alt}"
                                    )
                                    changed = True

        self.follow_sets = follow
        self.follow_explanations = explanations
        return follow

    def get_full_analysis(self) -> Dict[str, Any]:
        first = self.compute_first()
        follow = self.compute_follow()

        # Format sorted sets
        nt_first = {nt: sorted(list(first.get(nt, set()))) for nt in sorted(self.non_terminals)}
        nt_follow = {nt: sorted(list(follow.get(nt, set()))) for nt in sorted(self.non_terminals)}

        return {
            "first_sets": nt_first,
            "follow_sets": nt_follow,
            "nullable_symbols": sorted(list(self.nullable)),
            "first_explanations": self.first_explanations,
            "follow_explanations": self.follow_explanations,
        }
