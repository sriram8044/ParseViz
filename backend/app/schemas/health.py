from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "healthy"})
    service: str = Field(..., json_schema_extra={"example": "ParseViz Backend API"})
    version: str = Field(..., json_schema_extra={"example": "0.1.0"})
    details: Optional[Dict[str, Any]] = None
