from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class GrammarInputRequest(BaseModel):
    grammar: str = Field(..., description="Context-Free Grammar input text")
    start_symbol: Optional[str] = Field(None, description="Optional start symbol")


class TransformResponse(BaseModel):
    success: bool
    original_grammar: str
    transformed_grammar: str
    steps: List[str]
    non_terminals: List[str]
    terminals: List[str]
    rules_count: int


class FirstFollowResponse(BaseModel):
    success: bool
    start_symbol: str
    non_terminals: List[str]
    terminals: List[str]
    nullable_symbols: List[str]
    first_sets: Dict[str, List[str]]
    follow_sets: Dict[str, List[str]]
    first_explanations: Dict[str, List[str]]
    follow_explanations: Dict[str, List[str]]


class TableConflictSchema(BaseModel):
    non_terminal: str
    terminal: str
    conflict_type: str
    rules: List[str]
    explanation: str


class ParsingTableResponse(BaseModel):
    success: bool
    is_ll1: bool
    non_terminals: List[str]
    terminals: List[str]
    table: Dict[str, Dict[str, List[Dict[str, Any]]]]
    conflicts: List[TableConflictSchema]
    statistics: Dict[str, Any]


class ParseStringRequest(BaseModel):
    grammar: str = Field(..., description="CFG production rules")
    input_string: str = Field(..., description="Input string to simulate parse on")
    start_symbol: Optional[str] = None


class TraceStepSchema(BaseModel):
    step: int
    stack: str
    input: str
    lookahead: str
    action: str
    production: str
    status: str


class TreeNodeSchema(BaseModel):
    id: int
    name: str
    is_terminal: bool
    is_epsilon: bool
    children: List['TreeNodeSchema'] = []


class ParseResultResponse(BaseModel):
    success: bool
    input_tokens: List[str]
    steps_count: int
    error: Optional[str] = None
    trace: List[TraceStepSchema]
    parse_tree: Optional[Dict[str, Any]] = None

