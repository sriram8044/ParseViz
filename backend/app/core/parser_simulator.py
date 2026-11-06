from typing import List, Dict, Any, Optional
from app.core.grammar_symbols import GrammarSymbol, SymbolType
from app.core.grammar_model import Grammar
from app.core.parsing_table_engine import ParsingTableEngine
from app.core.grammar_tokenizer import GrammarTokenizer, TokenType


class ParseTreeNode:
    def __init__(self, name: str, node_id: int, is_terminal: bool = False, is_epsilon: bool = False):
        self.name = name
        self.node_id = node_id
        self.is_terminal = is_terminal
        self.is_epsilon = is_epsilon
        self.children: List['ParseTreeNode'] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.node_id,
            "name": self.name,
            "is_terminal": self.is_terminal,
            "is_epsilon": self.is_epsilon,
            "children": [child.to_dict() for child in self.children],
        }


class PredictiveParsingSimulator:
    """
    Executes stack-based LL(1) predictive parsing.
    Generates step-by-step execution traces and builds real Parse Trees.
    """

    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.pt_engine = ParsingTableEngine(grammar)
        self.table_data = self.pt_engine.build_table()
        self.table = self.table_data["table"]

    def tokenize_input(self, input_string: str) -> List[str]:
        """
        Tokenizes user input string matching grammar's terminal set.
        """
        tok = GrammarTokenizer(input_string)
        raw_tokens = tok.tokenize()
        terminals_list = []
        for t in raw_tokens:
            if t.type == TokenType.EOF:
                break
            if t.type == TokenType.NEWLINE:
                continue
            terminals_list.append(t.value)
        terminals_list.append("$")
        return terminals_list

    def parse(self, input_string: str) -> Dict[str, Any]:
        tokens = self.tokenize_input(input_string)
        stack: List[str] = ["$", self.grammar.start_symbol]
        
        # Parse tree node tracking: parallel stack for tree construction
        node_counter = 1
        root_node = ParseTreeNode(name=self.grammar.start_symbol, node_id=node_counter)
        tree_stack: List[Optional[ParseTreeNode]] = [None, root_node]

        trace_steps: List[Dict[str, Any]] = []
        step_number = 1
        cursor = 0
        accepted = False
        error_message = None

        max_steps = 1000 # safety limit against infinite loops
        while step_number <= max_steps:
            lookahead = tokens[cursor] if cursor < len(tokens) else "$"
            top_symbol = stack[-1] if stack else None
            top_tree_node = tree_stack[-1] if tree_stack else None

            remaining_input = " ".join(tokens[cursor:])
            stack_repr = " ".join(stack)

            # Check if accepted
            if top_symbol == "$" and lookahead == "$":
                trace_steps.append({
                    "step": step_number,
                    "stack": stack_repr,
                    "input": remaining_input,
                    "lookahead": lookahead,
                    "action": "ACCEPT",
                    "production": "",
                    "status": "success",
                })
                accepted = True
                break

            if not stack or top_symbol == "$":
                error_message = f"Unexpected token '{lookahead}'. Input remained while parsing stack was exhausted."
                trace_steps.append({
                    "step": step_number,
                    "stack": stack_repr,
                    "input": remaining_input,
                    "lookahead": lookahead,
                    "action": f"ERROR: {error_message}",
                    "production": "",
                    "status": "error",
                })
                break

            # If top is terminal: match
            if top_symbol not in self.grammar.non_terminals:
                if top_symbol == lookahead:
                    # Match
                    trace_steps.append({
                        "step": step_number,
                        "stack": stack_repr,
                        "input": remaining_input,
                        "lookahead": lookahead,
                        "action": f"MATCH '{lookahead}'",
                        "production": "",
                        "status": "matching",
                    })
                    stack.pop()
                    matched_node = tree_stack.pop()
                    if matched_node:
                        matched_node.is_terminal = True
                    cursor += 1
                    step_number += 1
                    continue
                else:
                    error_message = f"Mismatched token: expected '{top_symbol}', found '{lookahead}'."
                    trace_steps.append({
                        "step": step_number,
                        "stack": stack_repr,
                        "input": remaining_input,
                        "lookahead": lookahead,
                        "action": f"ERROR: {error_message}",
                        "production": "",
                        "status": "error",
                    })
                    break

            # Top is Non-Terminal
            candidates = self.table.get(top_symbol, {}).get(lookahead, [])
            if not candidates:
                error_message = f"No table entry for M[{top_symbol}, '{lookahead}']. Syntax error."
                trace_steps.append({
                    "step": step_number,
                    "stack": stack_repr,
                    "input": remaining_input,
                    "lookahead": lookahead,
                    "action": f"ERROR: {error_message}",
                    "production": "",
                    "status": "error",
                })
                break

            # Take the candidate (if multiple due to conflict, take first for deterministic trace)
            chosen_rule = candidates[0]
            action_desc = f"OUTPUT {chosen_rule['representation']}"

            trace_steps.append({
                "step": step_number,
                "stack": stack_repr,
                "input": remaining_input,
                "lookahead": lookahead,
                "action": action_desc,
                "production": chosen_rule["representation"],
                "status": "deriving",
            })

            # Pop Non-Terminal
            stack.pop()
            parent_node = tree_stack.pop()

            # Push right-hand side symbols in reverse
            symbols_to_push = chosen_rule["symbols"] # list of symbol dicts
            if chosen_rule["is_epsilon"]:
                # Epsilon node in tree
                node_counter += 1
                eps_node = ParseTreeNode(name="ε", node_id=node_counter, is_terminal=True, is_epsilon=True)
                if parent_node:
                    parent_node.children.append(eps_node)
            else:
                # Add child nodes to parent in forward order
                child_nodes: List[ParseTreeNode] = []
                for sym_dict in symbols_to_push:
                    node_counter += 1
                    is_t = sym_dict["type"] == "TERMINAL"
                    c_node = ParseTreeNode(name=sym_dict["name"], node_id=node_counter, is_terminal=is_t)
                    child_nodes.append(c_node)
                    if parent_node:
                        parent_node.children.append(c_node)

                # Push onto stack in reverse order
                for s_dict, c_node in zip(reversed(symbols_to_push), reversed(child_nodes)):
                    stack.append(s_dict["name"])
                    tree_stack.append(c_node)

            step_number += 1

        if step_number > max_steps:
            accepted = False
            error_message = "Parsing step limit exceeded. Possible cycle or ambiguity."

        return {
            "success": accepted,
            "error": error_message,
            "input_tokens": tokens,
            "steps_count": len(trace_steps),
            "trace": trace_steps,
            "parse_tree": root_node.to_dict() if accepted else None,
        }

