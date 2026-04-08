import os
from dotenv import load_dotenv

load_dotenv()

#Gemini 
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = "gemini-2.5-flash" 
GEMINI_URL:     str = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

#NewsAPI 
NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")

#JWT / Auth
SECRET_KEY:        str = os.getenv("SECRET_KEY", "fallback-secret-change-me")
ALGORITHM:         str = "HS256"
TOKEN_EXPIRE_HOURS: int = 1

#Rate Limiting
RATE_LIMIT_REQUESTS:        int = 10
RATE_LIMIT_WINDOW_MINUTES:  int = 60
GLOBAL_RATE_LIMIT:          int = 100

#Cache
CACHE_TTL_MINUTES: int = 30

#Server
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))


def validate_config():
    """Warn at startup if critical keys are missing."""
    warnings = []
    if not GEMINI_API_KEY:
        warnings.append("GEMINI_API_KEY not set — mock reports will be used")
    if not NEWS_API_KEY:
        warnings.append("NEWS_API_KEY not set — NewsAPI disabled (optional)")
    if SECRET_KEY == "fallback-secret-change-me":
        warnings.append("SECRET_KEY is using fallback — change it in .env!")
    for w in warnings:
        print(w)