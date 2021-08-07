"""This module contains the FastAPI router used for manipulating queue items"""
from typing import Optional

from fastapi import APIRouter, Depends

from pq_dashboard.connection import get_cursor
from pq_dashboard.data.items import (
    delete_item,
    get_item_counts,
    get_items,
    requeue_item,
)
from pq_dashboard.schema.item import ItemPage

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/")
async def items(
    cursor=Depends(get_cursor),
    limit: int = 10,
    offset: int = 0,
    queue: Optional[str] = None,
    exclude_processed: Optional[bool] = None,
    search: Optional[str] = None,
    order_by: Optional[str] = None,
):
    """Retrieve a list of items from the queue specified by the given parameters

    Kwargs:
        limit: Result pagination limit
        offset: Result pagination offset
        queue: Queue to filter items from. Default is None (all queues)
        exclude_processed: Filter out processed items when True
        order_by: Order results by
        search: Filter only for items matching term
    """
    records = get_items(
        cursor,
        limit=limit,
        offset=offset,
        queue_name=queue,
        exclude_processed=exclude_processed,
        search=search,
        order_by=order_by,
    )
    totals = get_item_counts(cursor, queue_name=queue, search=search)

    if exclude_processed:
        total = totals["queued"]
    else:
        total = totals["total"]

    return ItemPage(records=records, limit=limit, offset=offset, total=total)


@router.delete("/{item_id}")
async def delete(item_id: int, cursor=Depends(get_cursor)):
    delete_item(cursor, item_id)


@router.post("/{item_id}/requeue")
async def requeue(item_id: int, cursor=Depends(get_cursor)):
    requeue_item(cursor, item_id)
