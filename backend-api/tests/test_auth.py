"""Test authentication endpoints."""


def test_send_email_otp(client):
    """Test sending email OTP."""
    response = client.post(
        "/auth/email/otp",
        json={"email": "test@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_verify_email_otp_invalid(client):
    """Test verifying email OTP with invalid code."""
    response = client.post(
        "/auth/email/verify",
        json={"email": "test@example.com", "otp": "wrong"},
    )
    assert response.status_code == 401


def test_verify_email_otp_valid(client):
    """Test verifying email OTP with valid code (mock mode)."""
    # First send OTP
    client.post("/auth/email/otp", json={"email": "test@example.com"})

    # Then verify with mock OTP
    response = client.post(
        "/auth/email/verify",
        json={"email": "test@example.com", "otp": "123456"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert "refreshToken" in data


def test_send_phone_otp(client):
    """Test sending phone OTP."""
    response = client.post(
        "/auth/phone/otp",
        json={"phone": "+1234567890"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_google_login(client):
    """Test Google OAuth login."""
    response = client.post(
        "/auth/google",
        json={"idToken": "mock-google-token"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert "refreshToken" in data
