"""This module contains pydantic models for working with Items"""
from datetime import datetime
from typing import List, Optional, Union

from pydantic import BaseModel


class Item(BaseModel):
    """Pydantic model for a pq queue item"""

    id: int
    enqueued_at: datetime
    dequeued_at: Optional[datetime]
    expected_at: Optional[datetime]
    schedule_at: Optional[datetime]
    q_name: str
    data: Union[dict, list, str]


class ItemPage(BaseModel):
    """Pydantic model for a list of items"""

    records: List[Item]
    total: int
    limit: int
    offset: int
