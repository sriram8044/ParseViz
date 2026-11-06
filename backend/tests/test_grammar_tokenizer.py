import pytest
from app.core.grammar_tokenizer import GrammarTokenizer, TokenType
from app.core.exceptions import LexicalException


def test_tokenize_basic_production():
    text = "E -> E + T | T"
    tok = GrammarTokenizer(text)
    tokens = tok.tokenize()

    types = [t.type for t in tokens]
    values = [t.value for t in tokens]

    assert types == [
        TokenType.NON_TERMINAL,
        TokenType.ARROW,
        TokenType.NON_TERMINAL,
        TokenType.PUNCTUATION,
        TokenType.NON_TERMINAL,
        TokenType.PIPE,
        TokenType.NON_TERMINAL,
        TokenType.EOF,
    ]
    assert values[0] == "E"
    assert values[1] == "->"
    assert values[3] == "+"


def test_tokenize_terminals_and_quoted():
    text = "F -> ( E ) | id | '==' | \";\""
    tok = GrammarTokenizer(text)
    tokens = tok.tokenize()

    assert any(t.type == TokenType.TERMINAL_ID and t.value == "id" for t in tokens)
    assert any(t.type == TokenType.QUOTED_TERMINAL and t.value == "==" for t in tokens)
    assert any(t.type == TokenType.QUOTED_TERMINAL and t.value == ";" for t in tokens)


def test_tokenize_epsilon_representations():
    text = "A -> ε | epsilon | eps"
    tok = GrammarTokenizer(text)
    tokens = tok.tokenize()

    eps_tokens = [t for t in tokens if t.type == TokenType.EPSILON]
    assert len(eps_tokens) == 3
    assert all(t.value == "ε" for t in eps_tokens)


def test_tokenize_comments_and_whitespace():
    text = """
    // Single line comment
    # Another comment
    /* Multi line
       comment */
    E -> id
    """
    tok = GrammarTokenizer(text)
    tokens = tok.tokenize()

    non_terminals = [t for t in tokens if t.type == TokenType.NON_TERMINAL]
    assert len(non_terminals) == 1
    assert non_terminals[0].value == "E"


def test_lexical_error_unterminated_quote():
    text = "E -> 'unterminated"
    tok = GrammarTokenizer(text)
    with pytest.raises(LexicalException) as exc_info:
        tok.tokenize()
    assert "Unterminated quoted string" in str(exc_info.value)

