from app.core.grammar_parser import GrammarParser
from app.core.grammar_analyzer import GrammarSymbolAnalyzer


def test_analyzer_direct_left_recursion():
    text = """
    E -> E + T | T
    T -> T * F | F
    F -> id
    """
    grammar = GrammarParser(text).parse()
    analysis = GrammarSymbolAnalyzer(grammar).analyze()

    assert "E" in analysis.direct_left_recursive
    assert "T" in analysis.direct_left_recursive
    assert "F" not in analysis.direct_left_recursive


def test_analyzer_epsilon_non_terminals():
    text = """
    S -> A B
    A -> a | ε
    B -> b
    """
    grammar = GrammarParser(text).parse()
    analysis = GrammarSymbolAnalyzer(grammar).analyze()

    assert "A" in analysis.epsilon_non_terminals
    assert "B" not in analysis.epsilon_non_terminals
    assert "S" not in analysis.epsilon_non_terminals


def test_analyzer_counts():
    text = """
    S -> a | b | c
    """
    grammar = GrammarParser(text).parse()
    analysis = GrammarSymbolAnalyzer(grammar).analyze()

    assert analysis.production_count == 1
    assert analysis.alternative_count == 3
    assert set(analysis.terminals) == {"a", "b", "c"}

