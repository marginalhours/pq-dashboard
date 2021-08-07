"""This module contains pydantic models for working with Queues"""
from pydantic import BaseModel, Field


class Queue(BaseModel):
    name: str
    total: int
    queued: int = Field(0)
    processed: int = Field(0)
