import pytest
from app.core.grammar_parser import GrammarParser
from app.core.transformation_engine import TransformationAlgorithms
from app.core.first_follow_engine import FirstFollowEngine
from app.core.parsing_table_engine import ParsingTableEngine
from app.core.parser_simulator import PredictiveParsingSimulator
from app.core.exceptions import ParsingException, LexicalException


def test_complete_compiler_pipeline_workflow():
    """
    End-to-End Workflow:
    1. Enter arithmetic CFG.
    2. Validate.
    3. Eliminate left recursion.
    4. Compute FIRST & FOLLOW.
    5. Generate LL(1) Table.
    6. Simulate parse of 'id + id * id'.
    7. Verify parse tree generated.
    """
    # 1. Original CFG
    orig_text = """
    E -> E + T | T
    T -> T * F | F
    F -> ( E ) | id
    """
    grammar = GrammarParser(orig_text).parse()
    assert "E" in grammar.non_terminals
    assert "id" in grammar.terminals

    # 2. Eliminate Left Recursion
    transformed_grammar, steps = TransformationAlgorithms.eliminate_left_recursion(grammar)
    assert len(steps) > 0
    assert "E'" in transformed_grammar.non_terminals
    assert "T'" in transformed_grammar.non_terminals

    # 3. Apply Left Factoring
    factored_grammar, f_steps = TransformationAlgorithms.left_factor(transformed_grammar)

    # 4. FIRST & FOLLOW Sets
    ff_engine = FirstFollowEngine(factored_grammar)
    first_sets = ff_engine.compute_first()
    follow_sets = ff_engine.compute_follow()
    assert "id" in first_sets["E"]
    assert "(" in first_sets["E"]
    assert "$" in follow_sets["E"]

    # 5. LL(1) Table
    pt_engine = ParsingTableEngine(factored_grammar)
    table_data = pt_engine.build_table()
    assert table_data["is_ll1"] is True
    assert len(table_data["conflicts"]) == 0

    # 6. Parse string 'id + id * id'
    simulator = PredictiveParsingSimulator(factored_grammar)
    sim_result = simulator.parse("id + id * id")
    assert sim_result["success"] is True
    assert sim_result["error"] is None
    assert sim_result["steps_count"] > 10

    # 7. Parse Tree
    tree = sim_result["parse_tree"]
    assert tree is not None
    assert tree["name"] == "E"
    assert len(tree["children"]) > 0


def test_edge_cases():
    # Empty grammar raises error
    with pytest.raises(ParsingException):
        GrammarParser("").parse()

    # Empty whitespace
    with pytest.raises(ParsingException):
        GrammarParser("   \n\t  ").parse()

    # Missing production arrow
    with pytest.raises(ParsingException):
        GrammarParser("E + T").parse()

    # Unterminated quote
    with pytest.raises(LexicalException):
        GrammarParser("E -> 'id").parse()

    # Empty input string parsing
    grammar = GrammarParser("S -> a | ε").parse()
    sim = PredictiveParsingSimulator(grammar)
    res = sim.parse("")
    assert res["success"] is True # epsilon matches empty input

    # Nested parentheses parsing
    arith_grammar = GrammarParser("""
    E -> T E'
    E' -> + T E' | ε
    T -> F T'
    T' -> * F T' | ε
    F -> ( E ) | id
    """).parse()
    nested_sim = PredictiveParsingSimulator(arith_grammar)
    res_nested = nested_sim.parse("( ( id ) )")
    assert res_nested["success"] is True
    assert res_nested["parse_tree"] is not None

    # Syntax error with mismatched token
    res_err = nested_sim.parse("id +")
    assert res_err["success"] is False
    assert "Mismatched token" in res_err["error"] or "Syntax error" in res_err["error"]

