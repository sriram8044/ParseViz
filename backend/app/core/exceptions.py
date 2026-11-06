class GrammarException(Exception):
    """Base exception for all grammar-related operations."""

    def __init__(self, message: str, line: int = 1, column: int = 1):
        super().__init__(message)
        self.message = message
        self.line = line
        self.column = column

    def to_dict(self):
        return {
            "message": self.message,
            "line": self.line,
            "column": self.column,
        }


class LexicalException(GrammarException):
    """Raised when tokenization fails due to invalid characters or unterminated tokens."""
    pass


class ParsingException(GrammarException):
    """Raised when grammar production syntax is malformed or invalid."""
    pass


class ValidationException(GrammarException):
    """Raised when semantic grammar validation fails."""
    pass

