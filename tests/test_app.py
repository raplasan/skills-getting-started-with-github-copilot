import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_for_activity():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Remove if already exists
    client.delete(f"/activities/{activity}/participants/{email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity}"
    # Try duplicate signup
    response_dup = client.post(f"/activities/{activity}/signup?email={email}")
    assert response_dup.status_code == 400
    # Remove participant
    response_del = client.delete(f"/activities/{activity}/participants/{email}")
    assert response_del.status_code == 200
    assert response_del.json()["message"] == f"Removed {email} from {activity}"
    # Try removing again
    response_del2 = client.delete(f"/activities/{activity}/participants/{email}")
    assert response_del2.status_code == 404
