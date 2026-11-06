import pytest
from app.core.grammar_parser import GrammarParser
from app.core.grammar_validator import GrammarValidator


def test_validator_valid_grammar():
    text = "S -> a S | b"
    grammar = GrammarParser(text).parse()
    res = GrammarValidator(grammar).validate()
    assert res.is_valid
    assert len(res.errors) == 0


def test_validator_undefined_non_terminal():
    text = "S -> A b" # A is never defined
    grammar = GrammarParser(text).parse()
    res = GrammarValidator(grammar).validate()
    assert not res.is_valid
    assert any("has no production rules defined" in e.message for e in res.errors)


def test_validator_duplicate_alternative():
    text = "S -> a | a"
    grammar = GrammarParser(text).parse()
    res = GrammarValidator(grammar).validate()
    assert res.is_valid # warnings do not invalidate CFG
    assert any("Duplicate alternative" in w.message for w in res.warnings)


def test_validator_unreachable_symbol():
    text = """
    S -> a
    Unused -> b
    """
    grammar = GrammarParser(text).parse()
    res = GrammarValidator(grammar).validate()
    assert res.is_valid
    assert any("is unreachable" in w.message for w in res.warnings)


def test_validator_invalid_start_symbol():
    text = "S -> a"
    grammar = GrammarParser(text, user_start_symbol="NonExistent").parse()
    res = GrammarValidator(grammar).validate()
    assert not res.is_valid
    assert any("has no defined production rules" in e.message for e in res.errors)

