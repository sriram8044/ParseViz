from pydantic import BaseModel
from typing import Dict, Any, List
from app.core.grammar_parser import GrammarParser
from app.core.transformation_engine import TransformationAlgorithms
from app.core.first_follow_engine import FirstFollowEngine
from app.core.parsing_table_engine import ParsingTableEngine
from app.core.parser_simulator import PredictiveParsingSimulator
from app.core.grammar_serializer import GrammarSerializer


class DemoWorkflowResponse(BaseModel):
    success: bool
    original_grammar: str
    transformed_grammar: str
    transformation_steps: List[str]
    first_sets: Dict[str, List[str]]
    follow_sets: Dict[str, List[str]]
    is_ll1: bool
    conflicts_count: int
    test_input: str
    input_tokens: List[str]
    steps_count: int
    trace: List[Dict[str, Any]]
    parse_tree: Dict[str, Any]


def run_demonstration_workflow() -> Dict[str, Any]:
    """
    Executes live calculation of the classic arithmetic grammar:
    E -> E + T | T
    T -> T * F | F
    F -> ( E ) | id
    using string 'id + id * id'.
    """
    orig_grammar_text = "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id"
    test_input = "id + id * id"

    # Step 1: Parse original
    orig_grammar = GrammarParser(orig_grammar_text).parse()

    # Step 2: Eliminate Left Recursion
    transformed_grammar, steps = TransformationAlgorithms.eliminate_left_recursion(orig_grammar)
    factored_grammar, factor_steps = TransformationAlgorithms.left_factor(transformed_grammar)
    all_steps = steps + factor_steps

    serialized = GrammarSerializer.to_dict(factored_grammar)
    raw_transformed_text = "\n".join(r["raw_rule"] for r in serialized["productions"])

    # Step 3: Compute FIRST & FOLLOW
    ff_engine = FirstFollowEngine(factored_grammar)
    res_ff = ff_engine.get_full_analysis()

    # Step 4: Compute LL(1) Table
    pt_engine = ParsingTableEngine(factored_grammar)
    table_data = pt_engine.build_table()

    # Step 5: Simulate parsing 'id + id * id'
    simulator = PredictiveParsingSimulator(factored_grammar)
    sim_res = simulator.parse(test_input)

    return {
        "success": True,
        "original_grammar": orig_grammar_text,
        "transformed_grammar": raw_transformed_text,
        "transformation_steps": all_steps,
        "first_sets": res_ff["first_sets"],
        "follow_sets": res_ff["follow_sets"],
        "is_ll1": table_data["is_ll1"],
        "conflicts_count": len(table_data["conflicts"]),
        "test_input": test_input,
        "input_tokens": sim_res["input_tokens"],
        "steps_count": sim_res["steps_count"],
        "trace": sim_res["trace"],
        "parse_tree": sim_res["parse_tree"],
    }

