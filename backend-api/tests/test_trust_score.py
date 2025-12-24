"""Test trust score endpoints."""


def test_get_trust_score(client):
    """Test getting trust score."""
    response = client.get("/trust-score")
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "breakdown" in data
    assert "updatedAt" in data
    assert "suggestions" in data
    assert isinstance(data["score"], int)
    assert 0 <= data["score"] <= 100


def test_trust_score_breakdown(client):
    """Test trust score breakdown structure."""
    response = client.get("/trust-score")
    data = response.json()
    breakdown = data["breakdown"]
    assert "identity" in breakdown
    assert "activity" in breakdown
    assert "reputation" in breakdown
    assert all(0 <= breakdown[k] <= 100 for k in breakdown)


def test_trust_score_suggestions(client):
    """Test trust score suggestions."""
    response = client.get("/trust-score")
    data = response.json()
    suggestions = data["suggestions"]
    assert isinstance(suggestions, list)
    assert len(suggestions) <= 5  # Should be limited to top suggestions
