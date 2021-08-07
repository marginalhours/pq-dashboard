"""This module contains tests for the health check endpoints"""


def test_health_check(test_client):
    """Test that the healtcheck endpoint is reachable"""
    response = test_client.get("/api/v1/health/check")

    assert response.status_code == 200
    assert response.json() == {"still": "alive"}


def test_get_config(test_client):
    """Test that the config endpoint is reachable"""
    response = test_client.get("/api/v1/health/config")

    assert response.status_code == 200
    assert response.json() == {
        "DATABASE": "postgres",
        "PGHOST": "localhost",
        "PGUSER": "postgres",
        "QUEUE_TABLE": "queue",
        "PGPORT": 6543,
    }
