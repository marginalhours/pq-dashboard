"""This module defines the main FastAPI app"""
from functools import lru_cache
from pathlib import Path

import psycopg2
from fastapi import Depends, FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from pq_dashboard.routers import health, items, queues

app = FastAPI()


@lru_cache(maxsize=1)
def get_homepage_contents():
    with open(
        Path(__file__).parent / "frontend" / "www" / "index.html"
    ) as homepage_file:
        return homepage_file.read()


@app.get("/")
async def home(page=Depends(get_homepage_contents)):
    return HTMLResponse(page, status_code=200)


app.mount(
    "/assets",
    StaticFiles(directory=Path(__file__).parent / "frontend" / "www" / "assets"),
    name="assets",
)

# We prefix all API routes with `/api/v1`
# to make things cleaner on the FE
v1_api = FastAPI()


@v1_api.exception_handler(psycopg2.OperationalError)
async def db_exception_handler(request: Request, exc: psycopg2.OperationalError):
    """Exception handler for incorrectly configured database"""
    return JSONResponse(
        status_code=418,
        content={
            "message": f"Unable to connect to database. Your configuration may be incorrect"
        },
    )


v1_api.include_router(items.router)
v1_api.include_router(queues.router)
v1_api.include_router(health.router)

app.mount("/api/v1", v1_api)
