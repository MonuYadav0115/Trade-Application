from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import re

ALLOWED_SECTORS = [
    "pharmaceuticals", "technology", "agriculture", "automobiles",
    "textiles", "finance", "energy", "real estate", "healthcare",
    "manufacturing", "retail", "chemicals", "defence", "fmcg",
    "it", "banking", "telecom", "infrastructure", "education", "logistics"
]

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600

class TradeAnalysisResponse(BaseModel):
    sector: str
    generated_at: str
    session_id: str
    report: str
    sources_used: int
    cached: bool = False

class ErrorResponse(BaseModel):
    error: str
    detail: str
    status_code: int

class SessionInfo(BaseModel):
    session_id: str
    username: str
    request_count: int
    last_request: Optional[str]
    created_at: str