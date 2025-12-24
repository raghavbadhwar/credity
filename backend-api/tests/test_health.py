"""Test health endpoints."""


def test_liveness(client):
    """Test liveness probe."""
    response = client.get("/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_readiness(client):
    """Test readiness probe."""
    response = client.get("/health/ready")
    # May be 200 or 503 depending on Redis availability
    assert response.status_code in [200, 503]


def test_root(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CredVerse API"
    assert "version" in data


def test_me(client):
    """Test me endpoint."""
    response = client.get("/me")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
