"""Test credentials endpoints."""


def test_list_credentials(client):
    """Test listing credentials."""
    response = client.get("/credentials")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have mock credentials
    assert len(data) >= 1


def test_get_credential(client):
    """Test getting a specific credential."""
    response = client.get("/credentials/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "1"
    assert "name" in data
    assert "type" in data
    assert "status" in data


def test_get_credential_not_found(client):
    """Test getting a non-existent credential."""
    response = client.get("/credentials/non-existent")
    assert response.status_code == 404


def test_share_credential(client):
    """Test sharing a credential."""
    response = client.post("/credentials/1/share")
    assert response.status_code == 200
    data = response.json()
    assert "shareId" in data
    assert "qrPayload" in data
    # Check QR payload format
    assert "credverse://" in data["qrPayload"]


def test_share_inactive_credential(client):
    """Test sharing an inactive credential fails."""
    # Credential 3 is expired in mock data
    response = client.post("/credentials/3/share")
    assert response.status_code == 400


def test_revoke_credential(client):
    """Test revoking a credential."""
    response = client.post("/credentials/1/revoke")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
