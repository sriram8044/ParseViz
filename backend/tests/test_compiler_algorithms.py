import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.grammar_parser import GrammarParser
from app.core.transformation_engine import TransformationAlgorithms
from app.core.first_follow_engine import FirstFollowEngine
from app.core.parsing_table_engine import ParsingTableEngine
from app.core.parser_simulator import PredictiveParsingSimulator

client = TestClient(app)


def test_immediate_left_recursion():
    grammar = GrammarParser("E -> E + T | T").parse()
    res, steps = TransformationAlgorithms.eliminate_left_recursion(grammar)
    assert "E'" in res.non_terminals
    assert len(steps) > 0


def test_left_factoring():
    grammar = GrammarParser("S -> i E t S | i E t S e S | a").parse()
    res, steps = TransformationAlgorithms.left_factor(grammar)
    assert any("f" in nt for nt in res.non_terminals)


def test_first_follow_computation():
    text = """
    E -> T E'
    E' -> + T E' | ε
    T -> F T'
    T' -> * F T' | ε
    F -> ( E ) | id
    """
    grammar = GrammarParser(text).parse()
    engine = FirstFollowEngine(grammar)
    first = engine.compute_first()
    follow = engine.compute_follow()

    assert "(" in first["E"]
    assert "id" in first["E"]
    assert "+" in first["E'"]
    assert "ε" in first["E'"]
    assert "$" in follow["E"]
    assert ")" in follow["E"]


def test_ll1_table_and_parsing_simulator():
    text = """
    E -> T E'
    E' -> + T E' | ε
    T -> F T'
    T' -> * F T' | ε
    F -> ( E ) | id
    """
    grammar = GrammarParser(text).parse()
    pt = ParsingTableEngine(grammar).build_table()
    assert pt["is_ll1"] is True
    assert len(pt["conflicts"]) == 0

    simulator = PredictiveParsingSimulator(grammar)
    res = simulator.parse("id + id * id")
    assert res["success"] is True
    assert res["parse_tree"] is not None
    assert len(res["trace"]) > 5


def test_simulator_syntax_error():
    text = """
    E -> T E'
    E' -> + T E' | ε
    T -> id
    """
    grammar = GrammarParser(text).parse()
    simulator = PredictiveParsingSimulator(grammar)
    res = simulator.parse("id + +")
    assert res["success"] is False
    assert res["error"] is not None


def test_api_endpoints():
    # Test Left Recursion
    r = client.post("/api/grammar/transform/left-recursion", json={"grammar": "E -> E + T | T"})
    assert r.status_code == 200
    assert r.json()["success"] is True

    # Test First Follow
    r = client.post("/api/grammar/first-follow", json={"grammar": "S -> a S | b"})
    assert r.status_code == 200
    assert "a" in r.json()["first_sets"]["S"]

    # Test Table
    r = client.post("/api/grammar/parsing-table", json={"grammar": "S -> a | b"})
    assert r.status_code == 200
    assert r.json()["is_ll1"] is True

    # Test Parse Simulator
    r = client.post("/api/parser/parse", json={"grammar": "S -> a", "input_string": "a"})
    assert r.status_code == 200
    assert r.json()["success"] is True

