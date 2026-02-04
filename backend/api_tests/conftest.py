import pytest
import requests
from config import BASE_URL, LOGIN_ENDPOINT, LOGIN_PAYLOAD, TOKEN_KEY


@pytest.fixture(scope="session")
def auth_headers():
    response = requests.post(
        BASE_URL + LOGIN_ENDPOINT,
        json=LOGIN_PAYLOAD
    )

    assert response.status_code == 200, "Login failed"

    token = response.json().get(TOKEN_KEY)
    assert token, "JWT token not found in response"

    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
