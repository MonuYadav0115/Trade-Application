import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from config import SECRET_KEY, ALGORITHM, TOKEN_EXPIRE_HOURS

logger = logging.getLogger(__name__)

# username and admin-name password both 

USERS_DB: dict = {
    "Monu": {
        "username": "Monu",
        "password": bcrypt.hashpw("MonuYadav@0115".encode(), bcrypt.gensalt()).decode(),
        "role": "admin"
    },
    "Tom": {
        "username": "Tom",
        "password": bcrypt.hashpw("TomYadav@0115".encode(), bcrypt.gensalt()).decode(),
        "role": "user"
    }
}

ACTIVE_SESSIONS: dict[str, dict] = {}

security = HTTPBearer()


def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Validate username/password and return user dict or None."""
    user = USERS_DB.get(username)
    if not user:
        return None
    if not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return None
    return user


def create_access_token(username: str, role: str) -> tuple[str, str]:
    """
    Create a signed JWT and register a new session.
    Returns (token, session_id).
    """
    session_id = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)

    payload = {
        "sub": username,
        "role": role,
        "session_id": session_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    ACTIVE_SESSIONS[session_id] = {
        "session_id": session_id,
        "username": username,
        "request_count": 0,
        "last_request": None,
        "created_at": datetime.utcnow().isoformat()
    }
    logger.info(f"New session created: {session_id} for user: {username}")
    return token, session_id


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """FastAPI dependency — validates JWT and returns the decoded payload."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        session_id: str = payload.get("session_id")

        if not username or not session_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        if session_id not in ACTIVE_SESSIONS:
            raise HTTPException(status_code=401, detail="Session expired or invalid")

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def get_session(session_id: str) -> Optional[dict]:
    return ACTIVE_SESSIONS.get(session_id)


def update_session(session_id: str):
    """Increment request counter and timestamp for a session."""
    if session_id in ACTIVE_SESSIONS:
        ACTIVE_SESSIONS[session_id]["request_count"] += 1
        ACTIVE_SESSIONS[session_id]["last_request"] = datetime.utcnow().isoformat()