# Trade Opportunities API 

A FastAPI service that analyzes market data and provides AI-powered trade opportunity insights for specific sectors in India.

---

## Features

- **JWT Authentication** — Secure login with token-based access
- **Rate Limiting** — 10 requests/hour per user, 100/hour globally (in-memory)
- **AI Analysis** — Google Gemini API generates structured Markdown reports
- **Web Data Collection** — DuckDuckGo search + optional NewsAPI integration
- **Session Tracking** — Per-session request counters and timestamps
- **Input Validation** — Sector whitelist, regex sanitisation, Pydantic models
- **Auto-generated Docs** — Swagger UI at `/docs`, ReDoc at `/redoc`
- **Result Caching** — 30-minute in-memory cache per sector

---

## Project Structure

```
trade-api/
├── main.py              # FastAPI app, routes, middleware
├── auth.py              # JWT login, token verification, session store
├── rate_limiter.py      # In-memory rate limiting logic
├── data_collector.py    # DuckDuckGo + NewsAPI data collection
├── analyzer.py          # Gemini API integration + caching + mock fallback
├── models.py            # Pydantic request/response models
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
└── README.md
```

---

## Quick Start

### 1. Clone / Download

```bash
git clone <repo-url>
cd trade-api
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up API Keys

```bash
cp .env.example .env
# Edit .env and add your keys:
# GEMINI_API_KEY — https://aistudio.google.com/app/apikey  (free)
# NEWS_API_KEY   — https://newsapi.org/register             (optional, free)
```

Then update the keys directly in `analyzer.py` and `data_collector.py` (lines marked `YOUR_..._KEY_HERE`), or load them via environment variables.

### 4. Run the Server

```bash
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server starts at: **http://localhost:8000**

---

## API Usage

### Step 1 — Login and get JWT token

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo123"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Step 2 — Analyze a Sector

```bash
curl http://localhost:8000/analyze/pharmaceuticals \
  -H "Authorization: Bearer <your_token>"
```

**Response:**
```json
{
  "sector": "pharmaceuticals",
  "generated_at": "2024-11-15T10:30:00",
  "session_id": "uuid-here",
  "report": "# Trade Opportunities Report: Pharmaceuticals...",
  "sources_used": 8,
  "cached": false
}
```

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check & endpoint map |
| GET | `/health` | Server health + active sessions |
| GET | `/sectors` | List all supported sectors |
| POST | `/auth/login` | Get JWT token |
| GET | `/analyze/{sector}` | **Main endpoint** — get trade analysis |
| GET | `/session/info` | Current session details |
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc documentation |

---

## Supported Sectors

pharmaceuticals, technology, agriculture, automobiles, textiles, finance, energy, real estate, healthcare, manufacturing, retail, chemicals, defence, fmcg, it, banking, telecom, infrastructure, education, logistics

---

## Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT (HS256), 1-hour expiry |
| Input Validation | Pydantic models + regex whitelist |
| Rate Limiting | 10 req/hour/user, 100 req/hour global |
| Session Management | In-memory session store with UUID |
| CORS | Configurable (restrict origins in production) |

---

## Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| demo | demo123 | user |

>  Change these credentials before deploying to production.

---

## Architecture Flow

```
HTTP Request
     │
     ▼
JWT Auth Check  ──── 401 if invalid
     │
     ▼
Rate Limit Check ─── 429 if exceeded
     │
     ▼
Input Validation ─── 400 if invalid sector
     │
     ▼
Data Collection (DuckDuckGo + NewsAPI)
     │
     ▼
Gemini AI Analysis (with 30min cache)
     │
     ▼
Markdown Report Response (200 OK)
```

---

## Notes

- **No database required** — all state is in-memory (resets on restart)
- **Fallback mode** — works without API keys using mock/template reports
- **Caching** — repeated requests for the same sector return cached results for 30 minutes
- **Async** — all I/O operations are fully async for performance