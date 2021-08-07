"""This module contains tests for the Items endpoints"""


def test_get_items(test_client, test_pq):
    """Test that items can be retrieved from a queue"""
    # Given: 3 items
    test_pq["one"].put("item 1")
    test_pq["one"].put("item 2")
    test_pq["one"].put("item 3")

    # When: They are retrieved
    response = test_client.get("/api/v1/items/")

    # Then: They are in the response
    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 3
    assert data["limit"] == 10
    assert data["offset"] == 0


def test_get_items_filtered_by_queue(test_client, test_pq):
    """Test retrieving items from a single queue"""
    # Given: 2 items in a queue, and one out of it
    test_pq["one"].put("item 1")
    test_pq["one"].put("item 2")
    test_pq["two"].put("item 3")

    # When: Items in that queue are fetched
    response = test_client.get("/api/v1/items/?queue=one")

    # Then: There are only 2 items
    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert data["limit"] == 10
    assert data["offset"] == 0


def test_delete_item(test_client, test_pq):
    """Test deleting an item from a queue"""
    # Given: An item
    test_pq["one"].put("item1")
    response = test_client.get("/api/v1/items/")
    id_ = response.json()["records"][0]["id"]

    # When: The item is deleted
    test_client.delete(f"/api/v1/items/{id_}")

    # Then: It doesn't appear in the queue any more
    response = test_client.get("/api/v1/items/?queue=one")

    data = response.json()

    assert data["total"] == 0
    assert data["records"] == []


def test_requeue_item(test_client, test_pq):
    """Test requeueing an item"""
    # Given: An item
    test_pq["one"].put("item1")
    response = test_client.get("/api/v1/items/")
    id_ = response.json()["records"][0]["id"]

    # When: The item is requeued
    test_client.post(f"/api/v1/items/{id_}/requeue")

    # Then: There are now 2 items
    response = test_client.get("/api/v1/items/?queue=one")

    data = response.json()

    assert data["total"] == 2


def test_get_pickled_item(test_client, test_pq):
    """Test retrieving an item from a pickled queue"""
    # Given: An item in a pickled queue
    test_pq["one/pickle"].put({1, 2, 3})

    # When: Items are retrieved
    response = test_client.get(f"/api/v1/items/?queue=one")

    assert response.status_code == 200

    item = response.json()["records"][0]

    assert item["data"] == [1, 2, 3]


def test_get_items_no_processed(test_client, test_pq):
    """Test retrieving items without processed items"""
    # Given: Multiple items in a queue
    test_pq["one"].put({"task": "item 1"})
    test_pq["one"].put({"task": "item 2"})
    test_pq["one"].put({"task": "item 3"})

    _ = test_pq["one"].get()

    # When: Items are retrieved
    response = test_client.get(f"/api/v1/items/?queue=one&exclude_processed=true")

    assert response.status_code == 200

    assert len(response.json()["records"]) == 2


def test_get_items_search(test_client, test_pq):
    """Test filtering items by content"""
    # Given: Multiple items in a queue
    test_pq["one"].put({"task": "item 1", "args": ["two", "red", "oranges"]})
    test_pq["two"].put({"task": "item 2", "args": ["three", "green", "apples"]})

    # When: Items are retrieved
    response = test_client.get(f"/api/v1/items/?search=oranges")

    assert response.status_code == 200
    assert len(response.json()["records"]) == 1
