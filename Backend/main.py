import logging
import re
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Path, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth import (
    authenticate_user,
    create_access_token,
    verify_token,
    get_session,
    update_session,
    ACTIVE_SESSIONS
)
from rate_limiter import check_rate_limit, get_rate_limit_status
from data_collector import collect_sector_data
from analyzer import analyze_with_gemini
from models import (
    LoginRequest,
    TokenResponse,
    TradeAnalysisResponse,
    SessionInfo,
    ALLOWED_SECTORS
)

#Logging 
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)


# App
from config import validate_config

@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_config()  
    logger.info("Trade Opportunities API starting up...")
    yield
    logger.info("Trade Opportunities API shutting down...")


app = FastAPI(
    title="Trade Opportunities API",
    description=(
        "Analyzes market data and provides trade opportunity insights "
        "for specific sectors in India. Powered by Gemini AI."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handler 
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


# Routes 

@app.get("/", tags=["Health"])
async def root():
    """Health check / welcome endpoint."""
    return {
        "message": "Trade Opportunities API is running 🚀",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "login": "POST /auth/login",
            "analyze": "GET /analyze/{sector}",
            "session": "GET /session/info",
            "sectors": "GET /sectors"
        }
    }


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_sessions": len(ACTIVE_SESSIONS)
    }


@app.get("/sectors", tags=["Info"])
async def list_sectors():
    """List all supported sectors."""
    return {
        "supported_sectors": ALLOWED_SECTORS,
        "total": len(ALLOWED_SECTORS),
        "example": "/analyze/pharmaceuticals"
    }


#  Auth

@app.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login(body: LoginRequest):
    """
    Authenticate with username/password and receive a JWT token.

    **Demo credentials:**
    - username: `admin`, password: `admin123`
    - username: `demo`,  password: `demo123`
    """
    # Input sanitisation
    if not re.match(r"^[a-zA-Z0-9_]{3,30}$", body.username):
        raise HTTPException(status_code=400, detail="Invalid username format")

    user = authenticate_user(body.username, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token, session_id = create_access_token(user["username"], user["role"])
    logger.info(f"User '{body.username}' logged in successfully (session: {session_id})")

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=3600
    )


# Core Endpoint

@app.get(
    "/analyze/{sector}",
    response_model=TradeAnalysisResponse,
    tags=["Trade Analysis"],
    summary="Get trade opportunity analysis for a sector"
)
async def analyze_sector(
    sector: str = Path(
        ...,
        description="Sector name e.g. pharmaceuticals, technology, agriculture",
        min_length=2,
        max_length=50
    ),
    token_payload: dict = Depends(verify_token)
):
    """
    ## Trade Opportunity Analysis

    Accepts a **sector name** and returns a structured Markdown market analysis report.

    ### What it does:
    1. Validates and sanitises the sector input
    2. Enforces per-user rate limiting
    3. Collects live market data via web search
    4. Sends data to Gemini AI for structured analysis
    5. Returns a full Markdown report with trade insights

    ### Authentication:
    Requires a valid JWT bearer token. Get one via `POST /auth/login`.
    """
    # Input validation
    sector = sector.lower().strip()
    if not re.match(r"^[a-zA-Z\s\-]{2,50}$", sector):
        raise HTTPException(
            status_code=400,
            detail="Invalid sector name. Use only letters, spaces, or hyphens."
        )
    if sector not in ALLOWED_SECTORS:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Unsupported sector",
                "message": f"'{sector}' is not supported.",
                "supported_sectors": ALLOWED_SECTORS
            }
        )

    #Rate limiting 
    username   = token_payload["sub"]
    session_id = token_payload["session_id"]
    check_rate_limit(username)

    # Session tracking
    update_session(session_id)

    # Data collection 
    logger.info(f"[{username}] Analyzing sector: {sector}")
    try:
        collected_data = await collect_sector_data(sector)
    except Exception as e:
        logger.error(f"Data collection failed: {e}")
        collected_data = {"sector": sector, "data_points": [], "total_sources": 0,
                          "collected_at": datetime.utcnow().isoformat()}

    # AI Analysis
    try:
        report, was_cached = await analyze_with_gemini(sector, collected_data)
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=502, detail=f"Analysis service unavailable: {str(e)}")

    return TradeAnalysisResponse(
        sector=sector,
        generated_at=datetime.utcnow().isoformat(),
        session_id=session_id,
        report=report,
        sources_used=collected_data.get("total_sources", 0),
        cached=was_cached
    )


# Session Info

@app.get("/session/info", response_model=SessionInfo, tags=["Session"])
async def session_info(token_payload: dict = Depends(verify_token)):
    """Return current session details and rate limit usage."""
    session_id = token_payload["session_id"]
    username   = token_payload["sub"]
    session    = get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    rate_status = get_rate_limit_status(username)

    return SessionInfo(
        session_id=session_id,
        username=username,
        request_count=session["request_count"],
        last_request=session.get("last_request"),
        created_at=session["created_at"]
    )
#Entry point 
if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
    