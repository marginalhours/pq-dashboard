"""This module contains configuration logic using environment variables
for the pq-dashboard application"""
from pydantic import BaseSettings


class Settings(BaseSettings):
    """
    Settings for pq-dashboard. All can be edited by defining
    environment variables prefixed with PQ_DASH_.
    ex PQ_DASH_DB_HOST to change the postgres server location
    """

    PGHOST: str = "localhost"
    PGPORT: int = 5432
    PGUSER: str = "postgres"
    PGPASSWORD: str = "postgres"
    DATABASE: str = "postgres"
    QUEUE_TABLE: str = "queue"

    class Config:
        env_prefix = "PQ_DASH_"


settings = Settings(_env_file=".pq-dash.env")
