"""This module contains helper methods for working with items"""
import json
import pickle
from typing import Dict, List

from pq_dashboard.config import settings
from pq_dashboard.schema.item import Item


def get_item_counts(
    cursor, queue_name: str = None, search: str = None
) -> Dict[str, int]:
    """Get count of queued, processed and total items"""
    statement = f"SELECT (dequeued_at IS NOT NULL) AS dequeued, COUNT(dequeued_at IS NOT NULL) FROM {settings.QUEUE_TABLE}"
    parameters = []

    where_clauses = []

    if queue_name is not None:
        where_clauses.append("q_name = %s")
        parameters.append(queue_name)

    if search is not None:
        search = search.replace("=", "==").replace("%", "=%").replace("_", "=_")
        where_clauses.append("data::TEXT ILIKE %s ESCAPE '='")
        parameters.append("%" + search + "%")

    if len(where_clauses) > 0:
        where_clause = " WHERE " + " AND ".join(where_clauses)
    else:
        where_clause = ""

    statement += where_clause
    statement += " GROUP BY dequeued"

    cursor.execute(statement, tuple(parameters))

    results = cursor.fetchall()

    labels = {True: "processed", False: "queued"}

    response = {labels[state]: count for state, count in results}

    response["total"] = sum(response.values())

    return response


def get_order_by_clause(order_by=None):
    """
    Helper method to build an ordering clause based on
    selected ordering from the frontend
    """
    ordering = {
        "enqueuedAt_ASC": " enqueued_at ASC ",
        "enqueuedAt_DESC": " enqueued_at DESC ",
        "dequeuedAt_ASC": "dequeued_at ASC",
        "dequeuedAt_DESC": "dequeued_at DESC",
        "expectedAt_ASC": "expected_at ASC",
        "expectedAt_DESC": "expected_at DESC",
        "scheduledAt_ASC": "scheduled_at ASC",
        "scheduledAt_DESC": "scheduled_at DESC",
        "queue_ASC": "q_name ASC",
        "queue_DESC": "q_name DESC",
    }.get(order_by, "enqueued_at ASC")

    return f" ORDER BY {ordering} LIMIT %s OFFSET %s"


def get_items(
    cursor,
    limit=25,
    offset=0,
    queue_name=None,
    exclude_processed=False,
    search=None,
    order_by=None,
) -> List[Item]:
    """Get queue items

    Args:
        cursor: DB cursor
        limit (int, optional): How many items to fetch. Defaults to 25.
        offset (int, optional): How many items to skip fetching. Defaults to 0.

    Returns:
        List[Item]: Items retrieved from the relevant queue table
    """
    select_clause = f"SELECT id, enqueued_at, dequeued_at, expected_at, schedule_at, q_name, data FROM {settings.QUEUE_TABLE}"
    params = []

    where_clauses = []

    if queue_name is not None:
        where_clauses.append("q_name = %s")
        params.append(queue_name)

    if exclude_processed == True:
        where_clauses.append("dequeued_at IS NULL")

    if search is not None:
        search = search.replace("=", "==").replace("%", "=%").replace("_", "=_")
        where_clauses.append("data::TEXT ILIKE %s ESCAPE '='")
        params.append("%" + search + "%")

    order_by_clause = get_order_by_clause(order_by)
    params.extend([limit, offset])

    if len(where_clauses) > 0:
        where_clause = " WHERE " + " AND ".join(where_clauses)
    else:
        where_clause = ""

    cursor.execute(
        select_clause + where_clause + order_by_clause,
        tuple(params),
    )

    items = []
    for object in cursor.fetchall():

        if isinstance(object["data"], str):
            # data is a string for PQ's pickled queues.
            # In this case we try to deserialize using pickle
            try:
                object["data"] = pickle.loads(object["data"].encode("latin-1"))
            except pickle.UnpicklingError as err:
                # We assume the fact it's an invalid pickle means it's an ordinary string
                pass

        if isinstance(object["data"], bytes):
            try:
                object["data"] = pickle.loads(object["data"])
            except pickle.UnpicklingError as err:
                object["data"] = "<unknown binary data>"

        items.append(Item(**object))

    return items


def delete_item(cursor, item_id: int):
    """Delete an item from the queue by its ID

    Args:
        cursor: DB cursor
        item_id (int): ID of the item to delete
    """
    cursor.execute(f"DELETE FROM {settings.QUEUE_TABLE} WHERE id = %s", (item_id,))
    cursor.connection.commit()


def requeue_item(cursor, item_id: int):
    """Requeue an item by its ID

    Args:
        cursor: DB cursor
        item_id (int): ID of the item to requeue
    """
    cursor.execute(
        f"SELECT q_name, data FROM {settings.QUEUE_TABLE} WHERE id = %s", (item_id,)
    )

    result = cursor.fetchone()

    cursor.execute(
        f"INSERT INTO {settings.QUEUE_TABLE}(q_name, data) VALUES(%s, %s)",
        (result[0], json.dumps(result[1])),
    )
