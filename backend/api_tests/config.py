import os

BASE_URL = os.getenv("API_TEST_BASE_URL", "http://127.0.0.1:8000")

LOGIN_ENDPOINT = "/api/v1/auth/login"

LOGIN_PAYLOAD = {
    "email": os.getenv("API_TEST_EMAIL", "admin.user@cygnet.one"),
    "password": os.getenv("API_TEST_PASSWORD", "user.one@cygnet.one")
}

TOKEN_KEY = "access_token"

OPENAPI_FILE = "openapi.json"

SKIP_PATHS = [
    "/",
    "/health",
    "/users"
]
