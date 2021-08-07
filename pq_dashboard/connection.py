"""This module contains utilities for interacting with the database"""
from contextlib import contextmanager

from psycopg2 import connect
from psycopg2.extras import DictCursor

from pq_dashboard.config import settings


def get_connection():
    """Utility function for connecting to Postgres"""
    connection = connect(
        database=settings.DATABASE,
        user=settings.PGUSER,
        password=settings.PGPASSWORD,
        host=settings.PGHOST,
        port=settings.PGPORT,
        cursor_factory=DictCursor,
    )

    return connection


def get_cursor():
    """FastAPI DI function for getting a DB cursor which cleans up after itself"""
    connection = get_connection()
    cursor = connection.cursor()

    yield cursor

    connection.commit()
    cursor.close()
    connection.close()


@contextmanager
def cursor_manager():
    """Standalone ContextManager variation of get_cursor for CLI scripts"""
    yield from get_cursor()
