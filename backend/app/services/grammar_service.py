from typing import List, Dict, Any, Optional
from app.core.grammar_engine import GrammarEngine
from app.core.exceptions import GrammarException
from app.schemas.grammar import ExampleGrammar

# Curated catalog of standard CFG examples
EXAMPLE_GRAMMARS: List[Dict[str, Any]] = [
    {
        "id": "arithmetic-classic",
        "title": "Classic Arithmetic Expressions",
        "category": "Expressions",
        "description": "Standard left-recursive arithmetic grammar with addition, multiplication, parentheses, and identifiers.",
        "grammar": "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id",
        "start_symbol": "E",
        "has_left_recursion": True,
        "has_epsilon": False,
    },
    {
        "id": "assignment-simple",
        "title": "Simple Assignment Grammar",
        "category": "Imperative Statements",
        "description": "Grammar for variable assignments, identifiers, and numeric constants.",
        "grammar": "Assign -> id = Expr ;\nExpr -> Term Rest\nRest -> + Term Rest | ε\nTerm -> id | num",
        "start_symbol": "Assign",
        "has_left_recursion": False,
        "has_epsilon": True,
    },
    {
        "id": "arithmetic-epsilon",
        "title": "Transformed Non-Left-Recursive Arithmetic (LL(1) Ready)",
        "category": "LL(1) Grammars",
        "description": "Arithmetic expression grammar with left-recursion removed using primes and epsilon rules.",
        "grammar": "E -> T E'\nE' -> + T E' | ε\nT -> F T'\nT' -> * F T' | ε\nF -> ( E ) | id",
        "start_symbol": "E",
        "has_left_recursion": False,
        "has_epsilon": True,
    },
    {
        "id": "if-else-stmt",
        "title": "Conditional If-Else Statements",
        "category": "Control Flow",
        "description": "Grammar handling conditional branching with explicit dangling-else alternative resolution.",
        "grammar": "Stmt -> if ( Cond ) Stmt OptElse | id = id ;\nOptElse -> else Stmt | ε\nCond -> id == id | id != id",
        "start_symbol": "Stmt",
        "has_left_recursion": False,
        "has_epsilon": True,
    },
    {
        "id": "nested-parentheses",
        "title": "Balanced Nested Parentheses & Brackets",
        "category": "Dyck Language",
        "description": "Language of well-formed balanced parentheses and bracket expressions.",
        "grammar": "S -> ( S ) S | [ S ] S | ε",
        "start_symbol": "S",
        "has_left_recursion": False,
        "has_epsilon": True,
    },
    {
        "id": "direct-left-rec",
        "title": "Multi-Alternative Direct Left Recursion",
        "category": "Transformation Testing",
        "description": "Multiple immediate left-recursive branches to demonstrate elimination algorithms.",
        "grammar": "A -> A + B | A - B | B\nB -> B * C | C\nC -> num",
        "start_symbol": "A",
        "has_left_recursion": True,
        "has_epsilon": False,
    },
    {
        "id": "multi-alternatives",
        "title": "Multi-Alternative Type Declarations",
        "category": "Data Types",
        "description": "Programming language type specifier grammar with atomic types, pointers, and array qualifiers.",
        "grammar": "Type -> PrimType Modifiers\nPrimType -> int | float | char | bool | void\nModifiers -> * Modifiers | [ num ] Modifiers | ε",
        "start_symbol": "Type",
        "has_left_recursion": False,
        "has_epsilon": True,
    },
]


class GrammarService:
    @staticmethod
    def parse_grammar(grammar_text: str, start_symbol: Optional[str] = None) -> Dict[str, Any]:
        return GrammarEngine.parse_and_analyze(text=grammar_text, start_symbol=start_symbol)

    @staticmethod
    def validate_grammar(grammar_text: str, start_symbol: Optional[str] = None) -> Dict[str, Any]:
        return GrammarEngine.validate_only(text=grammar_text, start_symbol=start_symbol)

    @staticmethod
    def get_example_grammars() -> List[Dict[str, Any]]:
        return EXAMPLE_GRAMMARS

