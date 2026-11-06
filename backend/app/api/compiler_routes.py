from fastapi import APIRouter, HTTPException, status
from app.schemas.compiler import (
    GrammarInputRequest,
    TransformResponse,
    FirstFollowResponse,
    ParsingTableResponse,
    ParseStringRequest,
    ParseResultResponse,
)
from app.core.grammar_parser import GrammarParser
from app.core.transformation_engine import TransformationAlgorithms
from app.core.first_follow_engine import FirstFollowEngine
from app.core.parsing_table_engine import ParsingTableEngine
from app.core.parser_simulator import PredictiveParsingSimulator
from app.core.grammar_serializer import GrammarSerializer
from app.core.exceptions import GrammarException

router = APIRouter(prefix="", tags=["Compiler Engine"])


@router.post("/grammar/transform/left-recursion", response_model=TransformResponse)
def eliminate_left_recursion_endpoint(req: GrammarInputRequest):
    try:
        grammar = GrammarParser(req.grammar, user_start_symbol=req.start_symbol).parse()
        transformed, steps = TransformationAlgorithms.eliminate_left_recursion(grammar)
        serialized = GrammarSerializer.to_dict(transformed)
        raw_text = "\n".join(r["raw_rule"] for r in serialized["productions"])

        return TransformResponse(
            success=True,
            original_grammar=req.grammar,
            transformed_grammar=raw_text,
            steps=steps,
            non_terminals=serialized["non_terminals"],
            terminals=serialized["terminals"],
            rules_count=len(serialized["productions"]),
        )
    except GrammarException as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict())
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"message": str(e), "line": 1, "column": 1})


@router.post("/grammar/transform/left-factoring", response_model=TransformResponse)
def left_factoring_endpoint(req: GrammarInputRequest):
    try:
        grammar = GrammarParser(req.grammar, user_start_symbol=req.start_symbol).parse()
        factored, steps = TransformationAlgorithms.left_factor(grammar)
        serialized = GrammarSerializer.to_dict(factored)
        raw_text = "\n".join(r["raw_rule"] for r in serialized["productions"])

        return TransformResponse(
            success=True,
            original_grammar=req.grammar,
            transformed_grammar=raw_text,
            steps=steps,
            non_terminals=serialized["non_terminals"],
            terminals=serialized["terminals"],
            rules_count=len(serialized["productions"]),
        )
    except GrammarException as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict())
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"message": str(e), "line": 1, "column": 1})


@router.post("/grammar/first-follow", response_model=FirstFollowResponse)
def first_follow_endpoint(req: GrammarInputRequest):
    try:
        grammar = GrammarParser(req.grammar, user_start_symbol=req.start_symbol).parse()
        ff = FirstFollowEngine(grammar)
        res = ff.get_full_analysis()

        return FirstFollowResponse(
            success=True,
            start_symbol=grammar.start_symbol,
            non_terminals=[nt for nt in grammar.rules_order if nt in grammar.non_terminals],
            terminals=sorted(list(grammar.terminals)),
            nullable_symbols=res["nullable_symbols"],
            first_sets=res["first_sets"],
            follow_sets=res["follow_sets"],
            first_explanations=res["first_explanations"],
            follow_explanations=res["follow_explanations"],
        )
    except GrammarException as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict())
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"message": str(e), "line": 1, "column": 1})


@router.post("/grammar/parsing-table", response_model=ParsingTableResponse)
def parsing_table_endpoint(req: GrammarInputRequest):
    try:
        grammar = GrammarParser(req.grammar, user_start_symbol=req.start_symbol).parse()
        pt = ParsingTableEngine(grammar)
        data = pt.build_table()

        return ParsingTableResponse(
            success=True,
            is_ll1=data["is_ll1"],
            non_terminals=data["non_terminals"],
            terminals=data["terminals"],
            table=data["table"],
            conflicts=data["conflicts"],
            statistics=data["statistics"],
        )
    except GrammarException as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict())
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"message": str(e), "line": 1, "column": 1})


@router.post("/parser/parse", response_model=ParseResultResponse)
@router.post("/parser/trace", response_model=ParseResultResponse)
@router.post("/parser/parse-tree", response_model=ParseResultResponse)
def parse_and_simulate_endpoint(req: ParseStringRequest):
    try:
        grammar = GrammarParser(req.grammar, user_start_symbol=req.start_symbol).parse()
        simulator = PredictiveParsingSimulator(grammar)
        sim_res = simulator.parse(req.input_string)

        return ParseResultResponse(
            success=sim_res["success"],
            input_tokens=sim_res["input_tokens"],
            steps_count=sim_res["steps_count"],
            error=sim_res["error"],
            trace=sim_res["trace"],
            parse_tree=sim_res["parse_tree"],
        )
    except GrammarException as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict())
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"message": str(e), "line": 1, "column": 1})


from app.core.demo_engine import run_demonstration_workflow, DemoWorkflowResponse


@router.get("/demo/workflow", response_model=DemoWorkflowResponse)
def get_demonstration_workflow_endpoint():
    """
    Executes and returns a live, end-to-end guided compiler demonstration
    using the classic arithmetic grammar and 'id + id * id'.
    """
    try:
        return run_demonstration_workflow()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

