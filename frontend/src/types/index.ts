export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  details?: {
    compiler_engine?: string;
    sqlite_db?: string;
    environment?: string;
    [key: string]: unknown;
  };
}

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  badge?: string;
  category: 'core' | 'analysis' | 'tools' | 'system';
}

export interface GrammarTemplate {
  id: string;
  title: string;
  description: string;
  type: 'Arithmetic Expressions' | 'JSON-subset' | 'Conditionals' | 'Mini-C';
  productionCount: number;
  preview: string;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface RecentProjectItem {
  id: string;
  name: string;
  updatedAt: string;
  grammarType: string;
  terminalsCount: number;
  nonTerminalsCount: number;
}

// Phase 2 Grammar Interfaces
export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
  symbol?: string;
  line?: number;
  column?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

export interface SymbolItem {
  name: string;
  type: 'NON_TERMINAL' | 'TERMINAL' | 'EPSILON';
  is_quoted: boolean;
}

export interface AlternativeItem {
  symbols: SymbolItem[];
  representation: string;
  rule_index: number;
  line_number: number;
  is_epsilon: boolean;
}

export interface ProductionRuleItem {
  head: string;
  alternatives: AlternativeItem[];
  raw_rule: string;
}

export interface GrammarStatistics {
  production_count: number;
  alternative_count: number;
  epsilon_non_terminals: string[];
  direct_left_recursive: string[];
  direct_right_recursive: string[];
}

export interface GrammarResponse {
  success: boolean;
  start_symbol: string;
  non_terminals: string[];
  terminals: string[];
  productions: ProductionRuleItem[];
  validation: ValidationResult;
  statistics: GrammarStatistics;
  error?: string;
}

export interface ExampleGrammar {
  id: string;
  title: string;
  category: string;
  description: string;
  grammar: string;
  start_symbol: string;
  has_left_recursion: boolean;
  has_epsilon: boolean;
}

// Phase 3 Compiler Data Models
export interface TransformResponse {
  success: boolean;
  original_grammar: string;
  transformed_grammar: string;
  steps: string[];
  non_terminals: string[];
  terminals: string[];
  rules_count: number;
}

export interface FirstFollowResponse {
  success: boolean;
  start_symbol: string;
  non_terminals: string[];
  terminals: string[];
  nullable_symbols: string[];
  first_sets: Record<string, string[]>;
  follow_sets: Record<string, string[]>;
  first_explanations: Record<string, string[]>;
  follow_explanations: Record<string, string[]>;
}

export interface TableConflict {
  non_terminal: string;
  terminal: string;
  conflict_type: string;
  rules: string[];
  explanation: string;
}

export interface ParsingTableResponse {
  success: boolean;
  is_ll1: boolean;
  non_terminals: string[];
  terminals: string[];
  table: Record<string, Record<string, Array<{
    head: string;
    representation: string;
    rule_index: number;
    is_epsilon: boolean;
  }>>>;
  conflicts: TableConflict[];
  statistics: {
    total_cells: number;
    conflict_cells_count: number;
    first_first_conflicts: number;
    first_follow_conflicts: number;
  };
}

export interface TraceStep {
  step: number;
  stack: string;
  input: string;
  lookahead: string;
  action: string;
  production: string;
  status: string;
}

export interface ParseTreeNodeData {
  id: number;
  name: string;
  is_terminal: boolean;
  is_epsilon: boolean;
  children: ParseTreeNodeData[];
}

export interface ParseResultResponse {
  success: boolean;
  input_tokens: string[];
  steps_count: number;
  error?: string | null;
  trace: TraceStep[];
  parse_tree?: ParseTreeNodeData | null;
}

export interface DemoWorkflowData {
  success: boolean;
  original_grammar: string;
  transformed_grammar: string;
  transformation_steps: string[];
  first_sets: Record<string, string[]>;
  follow_sets: Record<string, string[]>;
  is_ll1: boolean;
  conflicts_count: number;
  test_input: string;
  input_tokens: string[];
  steps_count: number;
  trace: TraceStep[];
  parse_tree: ParseTreeNodeData;
}
