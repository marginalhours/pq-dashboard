"""This module contains helper methods for working with queues"""
from typing import Dict, List

from pq_dashboard.config import settings
from pq_dashboard.schema.queue import Queue


def get_queue_stats(cursor) -> List[Queue]:
    """Get a list of Queue objects

    Args:
        cursor ([type]): psycopg2 cursor

    Returns:
        List[Queue]: List of Queue statistics objects
    """
    cursor.execute(
        f"SELECT q_name, (dequeued_at IS NOT NULL) AS dequeued, COUNT(dequeued_at IS NOT NULL) FROM {settings.QUEUE_TABLE} GROUP BY q_name, dequeued"
    )
    results = cursor.fetchall()

    raw_queues_by_name: Dict[str, dict] = {}
    lookup = {True: "processed", False: "queued"}

    for name, item_type, count in results:
        raw_queues_by_name.setdefault(name, {})[lookup[item_type]] = count

    return [
        Queue(
            name=name,
            total=(value.get("processed", 0) + value.get("queued", 0)),
            **value,
        )
        for name, value in raw_queues_by_name.items()
    ]


def delete_queued_items(cursor, queue_name: str):
    """Delete all currently-queued items from a queue

    Args:
        cursor: DB cursor
        queue_name (str): Name of queue to empty
    """
    cursor.execute(
        f"DELETE FROM {settings.QUEUE_TABLE} WHERE q_name = %s AND dequeued_at IS NULL",
        (queue_name,),
    )
    cursor.connection.commit()


def delete_processed_items(cursor, queue_name: str):
    """Delete all processed (processed) items from a queue

    Args:
        cursor: DB cursor
        queue_name (str): Name of queue to cleanup items from
    """
    cursor.execute(
        f"DELETE FROM {settings.QUEUE_TABLE} WHERE q_name = %s AND dequeued_at IS NOT NULL",
        (queue_name,),
    )
    cursor.connection.commit()
