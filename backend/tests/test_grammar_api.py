from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_parse_valid_grammar():
    payload = {
        "grammar": "E -> E + T | T\nT -> id",
        "start_symbol": "E"
    }
    response = client.post("/api/grammar/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["start_symbol"] == "E"
    assert "E" in data["non_terminals"]
    assert "id" in data["terminals"]
    assert data["statistics"]["production_count"] == 2


def test_api_parse_invalid_syntax():
    payload = {
        "grammar": "E E + T", # missing arrow
    }
    response = client.post("/api/grammar/parse", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "line" in data["detail"]


def test_api_validate_endpoint():
    payload = {
        "grammar": "S -> A\nA -> a",
    }
    response = client.post("/api/grammar/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["validation"]["valid"] is True


def test_api_examples_endpoint():
    response = client.get("/api/grammar/examples")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    assert any(g["id"] == "arithmetic-classic" for g in data)

