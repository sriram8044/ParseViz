import pytest
from app.core.grammar_parser import GrammarParser
from app.core.exceptions import ParsingException


def test_parse_classic_arithmetic():
    text = """
    E -> E + T | T
    T -> T * F | F
    F -> ( E ) | id
    """
    parser = GrammarParser(text)
    grammar = parser.parse()

    assert grammar.start_symbol == "E"
    assert "E" in grammar.non_terminals
    assert "T" in grammar.non_terminals
    assert "F" in grammar.non_terminals
    assert "+" in grammar.terminals
    assert "*" in grammar.terminals
    assert "id" in grammar.terminals
    assert "(" in grammar.terminals
    assert ")" in grammar.terminals

    assert len(grammar.productions["E"]) == 2
    assert len(grammar.productions["T"]) == 2
    assert len(grammar.productions["F"]) == 2


def test_parse_custom_start_symbol():
    text = """
    E -> T
    T -> id
    """
    parser = GrammarParser(text, user_start_symbol="T")
    grammar = parser.parse()
    assert grammar.start_symbol == "T"


def test_parse_epsilon_rules():
    text = """
    S -> a S | ε
    """
    parser = GrammarParser(text)
    grammar = parser.parse()
    alts = grammar.productions["S"]
    assert len(alts) == 2
    assert alts[1].is_epsilon


def test_parse_empty_grammar_fails():
    with pytest.raises(ParsingException):
        GrammarParser("").parse()


def test_parse_missing_arrow_fails():
    with pytest.raises(ParsingException) as exc:
        GrammarParser("E E + T").parse()
    assert "Expected production arrow" in str(exc.value)


def test_parse_empty_alternative_fails():
    with pytest.raises(ParsingException) as exc:
        GrammarParser("E -> | T").parse()
    assert "Empty alternative" in str(exc.value)


def test_parse_epsilon_combined_fails():
    with pytest.raises(ParsingException) as exc:
        GrammarParser("E -> ε T").parse()
    assert "Epsilon cannot be combined" in str(exc.value)

