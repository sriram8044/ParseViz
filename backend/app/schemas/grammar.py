from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class GrammarParseRequest(BaseModel):
    grammar: str = Field(..., description="Context-Free Grammar production text")
    start_symbol: Optional[str] = Field(None, description="Optional custom start symbol")


class ValidationIssueSchema(BaseModel):
    level: str
    message: str
    symbol: Optional[str] = None
    line: Optional[int] = None
    column: Optional[int] = None


class ValidationSchema(BaseModel):
    valid: bool
    errors: List[ValidationIssueSchema] = []
    warnings: List[ValidationIssueSchema] = []
    info: List[ValidationIssueSchema] = []


class SymbolSchema(BaseModel):
    name: str
    type: str
    is_quoted: bool = False


class AlternativeSchema(BaseModel):
    symbols: List[SymbolSchema]
    representation: str
    rule_index: int
    line_number: int
    is_epsilon: bool


class ProductionRuleSchema(BaseModel):
    head: str
    alternatives: List[AlternativeSchema]
    raw_rule: str


class StatisticsSchema(BaseModel):
    production_count: int
    alternative_count: int
    epsilon_non_terminals: List[str] = []
    direct_left_recursive: List[str] = []
    direct_right_recursive: List[str] = []


class GrammarResponse(BaseModel):
    success: bool
    start_symbol: str
    non_terminals: List[str]
    terminals: List[str]
    productions: List[ProductionRuleSchema]
    validation: ValidationSchema
    statistics: StatisticsSchema
    error: Optional[str] = None


class GrammarValidateResponse(BaseModel):
    success: bool
    start_symbol: Optional[str] = None
    validation: ValidationSchema
    error: Optional[str] = None


class ExampleGrammar(BaseModel):
    id: str
    title: str
    category: str
    description: str
    grammar: str
    start_symbol: str
    has_left_recursion: bool = False
    has_epsilon: bool = False

