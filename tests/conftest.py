"""
Root-level conftest: Creates or obtains a postgres instance and makes sure
PQ has been initialized against it 
"""
import os

import pytest
from fastapi.testclient import TestClient
from pq import PQ
from pytest_postgresql import factories

POSTGRES_ARGS = {"port": 6543, "user": "postgres", "password": "postgres"}

if os.environ.get("GITHUB_WORKFLOW"):
    postgresql_process = factories.postgresql_noproc(**POSTGRES_ARGS)
else:
    postgresql_process = factories.postgresql_proc(**POSTGRES_ARGS)

    @pytest.fixture(autouse=True, scope="session")
    def trigger_postgresql_process(postgresql_process):
        pass


postgresql = factories.postgresql("postgresql_process")


@pytest.fixture(scope="session")
def test_client():
    """Fixture of a standard FastAPI test client"""
    from pq_dashboard.main import app

    yield TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def test_config():
    """Patch the configuration object for testing"""
    from pq_dashboard.config import settings

    settings.PGPORT = 6543


@pytest.fixture(scope="function")
def test_pq(test_config):
    """
    Per-function fixture of an initialized PQ instance
    """
    from pq_dashboard.connection import get_connection

    connection = get_connection()
    cursor = connection.cursor()

    queue = PQ(connection)
    queue.create()

    yield queue

    cursor.execute("DROP TABLE queue")
    connection.commit()
    connection.close()
