"""This module contains the FastAPI router used for manipulating queues"""
from fastapi import APIRouter, Depends, Response, status

from pq_dashboard.connection import get_cursor
from pq_dashboard.data.queues import (
    delete_processed_items,
    delete_queued_items,
    get_queue_stats,
)

router = APIRouter(prefix="/queues", tags=["queues"])


@router.get("/")
async def queues(cursor=Depends(get_cursor)):
    """Retrieve queue statistics"""
    return get_queue_stats(cursor)


@router.post("/{queue_name}/delete-queued")
async def delete_queued(queue_name: str, cursor=Depends(get_cursor)):
    """Delete all items from the queue with the given name"""
    delete_queued_items(cursor, queue_name)

    return Response(status_code=status.HTTP_200_OK)


@router.post("/{queue_name}/delete-processed")
async def delete_processed(queue_name: str, cursor=Depends(get_cursor)):
    """Delete all processed items from the queue with the given name"""
    delete_processed_items(cursor, queue_name)

    return Response(status_code=status.HTTP_200_OK)
