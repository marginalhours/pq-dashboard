"""This module contains tests for the Queue endpoints"""


def test_get_queue_statistics(test_client, test_pq):
    """Test that queue stats can be retrieved"""
    # Given: 3 queues with 1 item in each
    test_pq["one"].put("item 1")
    test_pq["two"].put("item 2")
    test_pq["three"].put("item 3")

    _ = test_pq["three"].get()

    # When: Queue stats are retrieved
    response = test_client.get("/api/v1/queues/")

    # Then: The queue stats are correct
    assert response.status_code == 200

    results = {x["name"]: x for x in response.json()}

    assert results == {
        "one": {"name": "one", "queued": 1, "processed": 0, "total": 1},
        "two": {"name": "two", "queued": 1, "processed": 0, "total": 1},
        "three": {"name": "three", "queued": 0, "processed": 1, "total": 1},
    }


def test_deleted_queued(test_client, test_pq):
    """Test that queued items can be removed from a queue"""
    # Given: 3 items in a queue, 1 processed
    test_pq["one"].put("item 1")
    test_pq["one"].put("item 2")
    test_pq["one"].put("item 3")

    _ = test_pq["one"].get()

    # When: Queued items are deleted
    response = test_client.post("/api/v1/queues/one/delete-queued")

    assert response.status_code == 200

    # Then: Only the processed item remains
    response = test_client.get("/api/v1/queues/")

    assert response.json() == [{"name": "one", "queued": 0, "processed": 1, "total": 1}]


def test_delete_processed(test_client, test_pq):
    """Test that processed items can be removed from a queue"""
    # Given: 3 items in a queue
    test_pq["one"].put("item 1")
    test_pq["one"].put("item 2")
    test_pq["one"].put("item 3")

    _ = test_pq["one"].get()

    # When: Processed items are deleted
    response = test_client.post("/api/v1/queues/one/delete-processed")

    assert response.status_code == 200

    # Then: Only the queued items remain
    response = test_client.get("/api/v1/queues/")

    assert response.json() == [{"name": "one", "queued": 2, "processed": 0, "total": 2}]
