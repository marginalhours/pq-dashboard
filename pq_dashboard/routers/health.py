"""This module defines the FastAPI healthcheck router"""
from fastapi import APIRouter, HTTPException

from pq_dashboard.config import settings
from pq_dashboard.connection import get_connection

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/check")
async def health_check():
    """Health check endpoint"""
    connection = None
    try:
        connection = get_connection()
        return {"still": "alive"}
    except Exception:
        raise HTTPException(status_code=500, detail="Cannot connect to database")
    finally:
        if connection:
            connection.close()


@router.get("/config")
async def config():
    """Get current configuration"""
    data = settings.dict()
    data.pop("PGPASSWORD", None)

    return data
