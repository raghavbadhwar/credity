"""Test verification endpoints."""


def test_create_verification_session(client):
    """Test creating a verification session."""
    response = client.post("/verification/sessions")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] == "pending"
    assert "steps" in data
    assert len(data["steps"]) >= 4  # At least 4 required steps


def test_get_verification_session(client):
    """Test getting a verification session."""
    # Create session first
    create_response = client.post("/verification/sessions")
    session_id = create_response.json()["id"]

    # Get session
    response = client.get(f"/verification/sessions/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == session_id


def test_submit_liveness(client):
    """Test submitting liveness check."""
    # Create session first
    create_response = client.post("/verification/sessions")
    session_id = create_response.json()["id"]

    # Submit liveness
    response = client.post(
        f"/verification/sessions/{session_id}/liveness",
        json={"mediaData": None},
    )
    assert response.status_code == 200
    data = response.json()
    # Check liveness step is updated
    liveness_step = next(
        (s for s in data["steps"] if "Liveness" in s["name"]), None
    )
    assert liveness_step is not None
    assert liveness_step["status"] == "completed"


def test_submit_document(client):
    """Test submitting document."""
    # Create session first
    create_response = client.post("/verification/sessions")
    session_id = create_response.json()["id"]

    # Submit document front
    response = client.post(
        f"/verification/sessions/{session_id}/document",
        json={"type": "front", "mediaData": None},
    )
    assert response.status_code == 200


def test_connect_digilocker(client):
    """Test connecting DigiLocker."""
    # Create session first
    create_response = client.post("/verification/sessions")
    session_id = create_response.json()["id"]

    # Connect DigiLocker
    response = client.post(f"/verification/sessions/{session_id}/digilocker")
    assert response.status_code == 200
    data = response.json()
    # Check DigiLocker step is updated
    digilocker_step = next(
        (s for s in data["steps"] if "DigiLocker" in s["name"]), None
    )
    assert digilocker_step is not None
    assert digilocker_step["status"] == "completed"


def test_verification_session_not_found(client):
    """Test getting a non-existent verification session."""
    response = client.get("/verification/sessions/non-existent-id")
    assert response.status_code == 404
