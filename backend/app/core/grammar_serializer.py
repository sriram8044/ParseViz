from typing import Dict, Any, List
from app.core.grammar_model import Grammar


class GrammarSerializer:
    """
    Serializes Grammar models into JSON-compatible dictionaries suitable for API responses.
    """

    @staticmethod
    def to_dict(grammar: Grammar) -> Dict[str, Any]:
        productions_data: List[Dict[str, Any]] = []

        for head in grammar.rules_order:
            if head in grammar.productions:
                alts = grammar.productions[head]
                productions_data.append({
                    "head": head,
                    "alternatives": [alt.to_dict() for alt in alts],
                    "raw_rule": f"{head} -> " + " | ".join(str(alt) for alt in alts),
                })

        return {
            "start_symbol": grammar.start_symbol,
            "non_terminals": [nt for nt in grammar.rules_order if nt in grammar.non_terminals],
            "terminals": sorted(list(grammar.terminals)),
            "productions": productions_data,
            "original_text": grammar.original_text,
        }

