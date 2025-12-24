"""Test connections endpoints."""


def test_list_connections(client):
    """Test listing active connections."""
    response = client.get("/connections")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have mock connections
    assert len(data) >= 1


def test_list_pending_connections(client):
    """Test listing pending connections."""
    response = client.get("/connections/pending")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_approve_connection(client):
    """Test approving a pending connection."""
    response = client.post("/connections/3/approve")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"


def test_deny_connection(client):
    """Test denying a connection."""
    response = client.post("/connections/3/deny")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_deny_nonexistent_connection(client):
    """Test denying a non-existent connection."""
    response = client.post("/connections/nonexistent/deny")
    assert response.status_code == 404


def test_webhook_receiver(client):
    """Test webhook receiver endpoint."""
    response = client.post(
        "/connections/webhooks",
        json={"event": "connection_request", "data": {"platform": "TestPlatform"}},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "webhookId" in data
