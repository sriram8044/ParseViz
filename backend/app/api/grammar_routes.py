from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.grammar import (
    GrammarParseRequest,
    GrammarResponse,
    GrammarValidateResponse,
    ExampleGrammar,
)
from app.services.grammar_service import GrammarService
from app.core.exceptions import GrammarException

router = APIRouter(prefix="/grammar", tags=["Grammar Engine"])


@router.post("/parse", response_model=GrammarResponse)
def parse_grammar_endpoint(request: GrammarParseRequest):
    """
    Parses CFG production rules, tokenizes symbols, extracts terminals/non-terminals,
    and returns structural representation.
    """
    try:
        result = GrammarService.parse_grammar(
            grammar_text=request.grammar,
            start_symbol=request.start_symbol,
        )
        return result
    except GrammarException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.to_dict(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": f"Grammar processing failed: {str(e)}", "line": 1, "column": 1},
        )


@router.post("/validate", response_model=GrammarValidateResponse)
def validate_grammar_endpoint(request: GrammarParseRequest):
    """
    Validates grammar syntax and semantics, reporting errors, warnings, and informational notices.
    """
    try:
        result = GrammarService.validate_grammar(
            grammar_text=request.grammar,
            start_symbol=request.start_symbol,
        )
        return result
    except GrammarException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.to_dict(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": f"Validation failed: {str(e)}", "line": 1, "column": 1},
        )


@router.post("/analyze", response_model=GrammarResponse)
def analyze_grammar_endpoint(request: GrammarParseRequest):
    """
    Computes comprehensive structural analysis, symbol inventory, recursion detection,
    and alternative breakdowns.
    """
    try:
        result = GrammarService.parse_grammar(
            grammar_text=request.grammar,
            start_symbol=request.start_symbol,
        )
        return result
    except GrammarException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.to_dict(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": f"Analysis failed: {str(e)}", "line": 1, "column": 1},
        )


@router.get("/examples", response_model=List[ExampleGrammar])
def get_example_grammars_endpoint():
    """
    Retrieves curated catalog of valid CFG examples across various categories.
    """
    return GrammarService.get_example_grammars()

