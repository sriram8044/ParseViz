from typing import Dict, List, Set, Tuple, Optional
from app.core.grammar_symbols import GrammarSymbol, SymbolType, EPSILON_SYMBOL
from app.core.grammar_model import Grammar, ProductionAlternative
import copy


class TransformationAlgorithms:
    """
    Implements Left Recursion Elimination (Immediate & Indirect)
    and Left Factoring on Grammar data models.
    """

    @classmethod
    def eliminate_immediate_left_recursion(
        cls,
        head: str,
        alternatives: List[ProductionAlternative],
        existing_non_terminals: Set[str],
        global_rule_counter_start: int = 1
    ) -> Tuple[List[ProductionAlternative], Optional[str], List[ProductionAlternative], int, List[str]]:
        """
        Eliminates immediate left recursion for:
        A -> A alpha_1 | ... | A alpha_m | beta_1 | ... | beta_n

        Transforms into:
        A  -> beta_1 A' | ... | beta_n A'
        A' -> alpha_1 A' | ... | alpha_m A' | ε
        """
        alpha_alts: List[Tuple[GrammarSymbol, ...]] = []
        beta_alts: List[Tuple[GrammarSymbol, ...]] = []
        steps: List[str] = []

        for alt in alternatives:
            if alt.symbols and alt.symbols[0].name == head:
                # Alpha alternative: symbols after head
                alpha_alts.append(alt.symbols[1:])
            else:
                beta_alts.append(alt.symbols)

        if not alpha_alts:
            return alternatives, None, [], global_rule_counter_start, steps

        # Create prime non-terminal name, e.g., A' or A_prime
        new_nt = f"{head}'"
        while new_nt in existing_non_terminals:
            new_nt = f"{new_nt}'"

        steps.append(
            f"Detected direct left recursion in '{head}'. Created auxiliary non-terminal '{new_nt}'."
        )

        counter = global_rule_counter_start
        new_head_alts: List[ProductionAlternative] = []
        new_prime_alts: List[ProductionAlternative] = []

        aux_symbol = GrammarSymbol(name=new_nt, symbol_type=SymbolType.NON_TERMINAL)

        # If no betas existed, beta is implicit epsilon: A -> A alpha => A -> A'
        if not beta_alts:
            beta_alts.append((aux_symbol,))
            new_head_alts.append(
                ProductionAlternative(
                    symbols=(aux_symbol,),
                    rule_index=counter,
                    line_number=1,
                )
            )
            counter += 1
        else:
            for beta in beta_alts:
                # If beta is epsilon, beta A' is just A'
                if len(beta) == 1 and beta[0].is_epsilon:
                    new_syms = (aux_symbol,)
                else:
                    new_syms = beta + (aux_symbol,)
                new_head_alts.append(
                    ProductionAlternative(
                        symbols=new_syms,
                        rule_index=counter,
                        line_number=1,
                    )
                )
                counter += 1

        for alpha in alpha_alts:
            new_syms = alpha + (aux_symbol,)
            new_prime_alts.append(
                ProductionAlternative(
                    symbols=new_syms,
                    rule_index=counter,
                    line_number=1,
                )
            )
            counter += 1

        # Add epsilon alternative to A'
        new_prime_alts.append(
            ProductionAlternative(
                symbols=(EPSILON_SYMBOL,),
                rule_index=counter,
                line_number=1,
            )
        )
        counter += 1

        steps.append(
            f"Transformed {head} -> {' | '.join(str(a) for a in new_head_alts)}"
        )
        steps.append(
            f"Created {new_nt} -> {' | '.join(str(a) for a in new_prime_alts)}"
        )

        return new_head_alts, new_nt, new_prime_alts, counter, steps

    @classmethod
    def eliminate_left_recursion(cls, grammar: Grammar) -> Tuple[Grammar, List[str]]:
        """
        Standard algorithm for eliminating both indirect and immediate left recursion.
        Order non-terminals: A_1, ..., A_n
        for i in 1 to n:
            for j in 1 to i - 1:
                replace A_i -> A_j gamma with A_i -> delta_1 gamma | ...
            eliminate immediate left recursion for A_i
        """
        steps: List[str] = []
        ordered_nts = [nt for nt in grammar.rules_order if nt in grammar.productions]
        all_nts = set(grammar.non_terminals)
        new_productions: Dict[str, List[ProductionAlternative]] = {}

        # Copy original productions
        for nt in ordered_nts:
            new_productions[nt] = list(grammar.productions[nt])

        global_counter = 1
        new_ordered_nts = list(ordered_nts)

        for i in range(len(ordered_nts)):
            A_i = ordered_nts[i]
            # Replace A_i -> A_j gamma
            for j in range(i):
                A_j = ordered_nts[j]
                current_alts = new_productions[A_i]
                expanded_alts: List[ProductionAlternative] = []
                replaced = False

                for alt in current_alts:
                    if alt.symbols and alt.symbols[0].name == A_j:
                        replaced = True
                        gamma = alt.symbols[1:]
                        # substitute with A_j alternatives
                        for alt_j in new_productions[A_j]:
                            if alt_j.is_epsilon:
                                new_syms = gamma if gamma else (EPSILON_SYMBOL,)
                            else:
                                new_syms = alt_j.symbols + gamma
                            expanded_alts.append(
                                ProductionAlternative(
                                    symbols=new_syms,
                                    rule_index=global_counter,
                                    line_number=alt.line_number,
                                )
                            )
                            global_counter += 1
                    else:
                        expanded_alts.append(alt)

                if replaced:
                    steps.append(f"Substituted non-terminal '{A_j}' in productions of '{A_i}' to resolve indirect recursion.")
                    new_productions[A_i] = expanded_alts

            # Eliminate immediate left recursion on A_i
            res_alts, aux_nt, aux_alts, global_counter, imm_steps = cls.eliminate_immediate_left_recursion(
                head=A_i,
                alternatives=new_productions[A_i],
                existing_non_terminals=all_nts,
                global_rule_counter_start=global_counter,
            )
            new_productions[A_i] = res_alts
            steps.extend(imm_steps)

            if aux_nt:
                all_nts.add(aux_nt)
                new_productions[aux_nt] = aux_alts
                new_ordered_nts.append(aux_nt)

        transformed_grammar = Grammar(
            start_symbol=grammar.start_symbol,
            non_terminals=all_nts,
            terminals=set(grammar.terminals),
            productions=new_productions,
            original_text=grammar.original_text,
            rules_order=new_ordered_nts,
        )

        return transformed_grammar, steps

    @classmethod
    def left_factor(cls, grammar: Grammar) -> Tuple[Grammar, List[str]]:
        """
        Applies Left Factoring using longest common prefixes repeatedly until no common prefix remains.
        A -> alpha beta_1 | alpha beta_2 | gamma
        transforms into:
        A  -> alpha A' | gamma
        A' -> beta_1 | beta_2
        """
        steps: List[str] = []
        new_productions: Dict[str, List[ProductionAlternative]] = {
            k: list(v) for k, v in grammar.productions.items()
        }
        all_nts = set(grammar.non_terminals)
        rules_order = list(grammar.rules_order)
        global_counter = 1

        changed = True
        pass_idx = 0
        while changed and pass_idx < 20: # prevent runaway
            changed = False
            pass_idx += 1

            for head in list(rules_order):
                alts = new_productions.get(head, [])
                if len(alts) < 2:
                    continue

                # Find longest common prefix among pairs
                best_prefix: Tuple[GrammarSymbol, ...] = ()
                matching_alts: List[ProductionAlternative] = []

                # Group by first symbol
                first_sym_groups: Dict[str, List[ProductionAlternative]] = {}
                for alt in alts:
                    if alt.symbols and not alt.is_epsilon:
                        key = str(alt.symbols[0])
                        first_sym_groups.setdefault(key, []).append(alt)

                target_group: Optional[List[ProductionAlternative]] = None
                for grp in first_sym_groups.values():
                    if len(grp) >= 2:
                        target_group = grp
                        break

                if target_group:
                    # Find longest common prefix
                    prefix_len = 0
                    min_len = min(len(a.symbols) for a in target_group)
                    for k in range(min_len):
                        sym_k = target_group[0].symbols[k]
                        if all(a.symbols[k] == sym_k for a in target_group):
                            prefix_len += 1
                        else:
                            break

                    best_prefix = target_group[0].symbols[:prefix_len]
                    matching_alts = target_group

                if best_prefix:
                    changed = True
                    # Create auxiliary non-terminal
                    aux_nt = f"{head}f"
                    while aux_nt in all_nts:
                        aux_nt = f"{aux_nt}'"

                    all_nts.add(aux_nt)
                    rules_order.append(aux_nt)
                    aux_symbol = GrammarSymbol(name=aux_nt, symbol_type=SymbolType.NON_TERMINAL)

                    remaining_alts: List[ProductionAlternative] = [
                        a for a in alts if a not in matching_alts
                    ]

                    # Auxiliary alternatives
                    aux_alts: List[ProductionAlternative] = []
                    for m_alt in matching_alts:
                        suffix = m_alt.symbols[len(best_prefix):]
                        if not suffix:
                            aux_alts.append(
                                ProductionAlternative(
                                    symbols=(EPSILON_SYMBOL,),
                                    rule_index=global_counter,
                                    line_number=m_alt.line_number,
                                )
                            )
                        else:
                            aux_alts.append(
                                ProductionAlternative(
                                    symbols=suffix,
                                    rule_index=global_counter,
                                    line_number=m_alt.line_number,
                                )
                            )
                        global_counter += 1

                    # Replace in head
                    new_head_alt = ProductionAlternative(
                        symbols=best_prefix + (aux_symbol,),
                        rule_index=global_counter,
                        line_number=1,
                    )
                    global_counter += 1

                    new_productions[head] = [new_head_alt] + remaining_alts
                    new_productions[aux_nt] = aux_alts

                    prefix_str = " ".join(str(s) for s in best_prefix)
                    steps.append(
                        f"Factored out common prefix '{prefix_str}' from '{head}'. Created '{aux_nt}'."
                    )
                    break

        factored_grammar = Grammar(
            start_symbol=grammar.start_symbol,
            non_terminals=all_nts,
            terminals=set(grammar.terminals),
            productions=new_productions,
            original_text=grammar.original_text,
            rules_order=rules_order,
        )

        return factored_grammar, steps

