from typing import Dict, Any, Optional
from app.core.grammar_parser import GrammarParser
from app.core.grammar_validator import GrammarValidator, ValidationResult
from app.core.grammar_analyzer import GrammarSymbolAnalyzer, SymbolAnalysis
from app.core.grammar_serializer import GrammarSerializer
from app.core.grammar_model import Grammar
from app.core.exceptions import GrammarException


class GrammarEngine:
    """
    Facade unifying Tokenizer, Parser, Validator, and Analyzer.
    Provides a clean, standalone, decoupled engine interface.
    """

    @classmethod
    def parse_and_analyze(
        cls, text: str, start_symbol: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parses, validates, and analyzes a context-free grammar string.
        """
        parser = GrammarParser(text=text, user_start_symbol=start_symbol)
        grammar: Grammar = parser.parse()

        validator = GrammarValidator(grammar=grammar)
        validation_res: ValidationResult = validator.validate()

        analyzer = GrammarSymbolAnalyzer(grammar=grammar)
        analysis: SymbolAnalysis = analyzer.analyze()

        serialized = GrammarSerializer.to_dict(grammar)

        return {
            "success": True,
            "start_symbol": grammar.start_symbol,
            "non_terminals": analysis.non_terminals,
            "terminals": analysis.terminals,
            "productions": serialized["productions"],
            "validation": validation_res.to_dict(),
            "statistics": {
                "production_count": analysis.production_count,
                "alternative_count": analysis.alternative_count,
                "epsilon_non_terminals": analysis.epsilon_non_terminals,
                "direct_left_recursive": analysis.direct_left_recursive,
                "direct_right_recursive": analysis.direct_right_recursive,
            },
        }

    @classmethod
    def validate_only(
        cls, text: str, start_symbol: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parses and validates grammar syntax and semantics without full analysis.
        """
        parser = GrammarParser(text=text, user_start_symbol=start_symbol)
        grammar = parser.parse()

        validator = GrammarValidator(grammar=grammar)
        validation_res = validator.validate()

        return {
            "success": True,
            "start_symbol": grammar.start_symbol,
            "validation": validation_res.to_dict(),
        }

