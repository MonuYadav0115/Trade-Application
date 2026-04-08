from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import HTTPException
import logging

from config import RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MINUTES, GLOBAL_RATE_LIMIT

logger = logging.getLogger(__name__)

user_request_log: dict[str, list[datetime]] = defaultdict(list)

# Global request log
global_request_log: list[datetime] = []


def _clean_old_requests(log: list[datetime], window_minutes: int) -> list[datetime]:
    """Remove timestamps outside the rolling window."""
    cutoff = datetime.utcnow() - timedelta(minutes=window_minutes)
    return [ts for ts in log if ts > cutoff]


def check_rate_limit(username: str):
    """
    Raises HTTP 429 if the user OR the global limit is exceeded.
    Call this before processing any request.
    """
    now = datetime.utcnow()

    # Per-user check
    user_request_log[username] = _clean_old_requests(
        user_request_log[username], RATE_LIMIT_WINDOW_MINUTES
    )
    if len(user_request_log[username]) >= RATE_LIMIT_REQUESTS:
        oldest = user_request_log[username][0]
        reset_in = int(
            (oldest + timedelta(minutes=RATE_LIMIT_WINDOW_MINUTES) - now).total_seconds()
        )
        logger.warning(f"Rate limit hit for user: {username}")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": f"Max {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW_MINUTES} minutes",
                "retry_after_seconds": max(reset_in, 1)
            }
        )

    # Global check
    global global_request_log
    global_request_log = _clean_old_requests(global_request_log, 60)
    if len(global_request_log) >= GLOBAL_RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Global rate limit exceeded",
                "message": "Server is busy. Please try again later.",
                "retry_after_seconds": 60
            }
        )

    #Record this request
    user_request_log[username].append(now)
    global_request_log.append(now)
    logger.debug(f"Request recorded for {username}. "
                 f"User count: {len(user_request_log[username])}")


def get_rate_limit_status(username: str) -> dict:
    """Return current usage stats for a user (useful for headers/debug)."""
    user_request_log[username] = _clean_old_requests(
        user_request_log[username], RATE_LIMIT_WINDOW_MINUTES
    )
    used = len(user_request_log[username])
    return {
        "requests_used": used,
        "requests_remaining": max(RATE_LIMIT_REQUESTS - used, 0),
        "limit": RATE_LIMIT_REQUESTS,
        "window_minutes": RATE_LIMIT_WINDOW_MINUTES
    }