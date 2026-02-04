import json
import pytest
import requests
from app.main import app
from config import BASE_URL, SKIP_PATHS


def load_openapi():
    return app.openapi()


def collect_endpoints():
    spec = load_openapi()
    endpoints = []

    for path, methods in spec["paths"].items():
        if path in SKIP_PATHS:
            continue

        for method, meta in methods.items():
            if method.lower() not in ["get", "post", "put", "delete", "patch"]:
                continue

            # Skip login itself (already tested in auth fixture)
            if path.endswith("/auth/login"):
                continue

            endpoints.append((method.upper(), path))

    return endpoints


ENDPOINTS = collect_endpoints()


@pytest.mark.parametrize("method,path", ENDPOINTS)
def test_api_endpoint(method, path, auth_headers):
    # Replace path params with dummy values
    url = path
    if "{" in path:
        url = path.replace("{room_id}", "test-room-id") \
                  .replace("{booking_id}", "test-booking-id") \
                  .replace("{user_id}", "test-user-id")

    response = requests.request(
        method=method,
        url=BASE_URL + url,
        headers=auth_headers
    )

    # Core safety assertions
    assert response.status_code < 500, f"{method} {path} crashed"

    # If response has body, it must be valid JSON
    if response.content:
        try:
            response.json()
        except Exception:
            pytest.fail(f"{method} {path} returned invalid JSON")
