import httpx
import asyncio
import logging
from datetime import datetime
from typing import Optional

from config import NEWS_API_KEY

logger = logging.getLogger(__name__)

DDG_SEARCH_URL = "https://api.duckduckgo.com/"
NEWS_API_URL   = "https://newsapi.org/v2/everything"


async def search_duckduckgo(query: str) -> list[dict]:
    """
    Query DuckDuckGo Instant Answer API.
    Returns a list of result dicts: {title, body, url}
    """
    results = []
    params = {
        "q": query,
        "format": "json",
        "no_redirect": "1",
        "no_html": "1",
        "skip_disambig": "1"
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(DDG_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

            if data.get("AbstractText"):
                results.append({
                    "title": data.get("Heading", query),
                    "body": data["AbstractText"],
                    "url": data.get("AbstractURL", "")
                })

            for topic in data.get("RelatedTopics", [])[:5]:
                if isinstance(topic, dict) and topic.get("Text"):
                    results.append({
                        "title": topic.get("Text", "")[:80],
                        "body": topic.get("Text", ""),
                        "url": topic.get("FirstURL", "")
                    })

    except Exception as e:
        logger.warning(f"DuckDuckGo search failed for '{query}': {e}")

    return results


async def search_news_api(sector: str) -> list[dict]:
    """
    Fetch recent news from NewsAPI (optional).
    Returns [] gracefully if key is not set or request fails.
    """
    if not NEWS_API_KEY:
        return []

    results = []
    try:
        params = {
            "q": f"{sector} India trade market 2024",
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": 5,
            "apiKey": NEWS_API_KEY
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(NEWS_API_URL, params=params)
            resp.raise_for_status()
            articles = resp.json().get("articles", [])
            for art in articles:
                results.append({
                    "title": art.get("title", ""),
                    "body": art.get("description") or art.get("content") or "",
                    "url": art.get("url", ""),
                    "published_at": art.get("publishedAt", "")
                })
    except Exception as e:
        logger.warning(f"NewsAPI failed for '{sector}': {e}")

    return results


async def collect_sector_data(sector: str) -> dict:
    """
    Main entry point. Runs multiple searches in parallel and
    returns a consolidated data dict ready for the LLM analyzer.
    """
    queries = [
        f"{sector} sector India trade opportunities 2024",
        f"India {sector} export import market trends",
        f"{sector} industry India growth challenges",
        f"India {sector} government policy regulations"
    ]

    search_tasks = [search_duckduckgo(q) for q in queries]
    news_task = search_news_api(sector)

    all_results = await asyncio.gather(*search_tasks, news_task)

    seen_urls: set[str] = set()
    combined: list[dict] = []
    for batch in all_results:
        for item in batch:
            url = item.get("url", "")
            if url not in seen_urls and item.get("body"):
                seen_urls.add(url)
                combined.append(item)

    logger.info(f"Collected {len(combined)} data points for sector: {sector}")

    return {
        "sector": sector,
        "collected_at": datetime.utcnow().isoformat(),
        "data_points": combined,
        "total_sources": len(combined)
    } 