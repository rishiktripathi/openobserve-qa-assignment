import uuid

import pytest

from utils.api_client import OpenObserveClient


@pytest.fixture
def client() -> OpenObserveClient:
    return OpenObserveClient()


@pytest.fixture
def unique_stream() -> str:
    return f"qa_test_logs_{uuid.uuid4().hex[:8]}"


@pytest.fixture
def sample_logs() -> list[dict]:
    return [
        {"level": "info", "message": "User logged in", "user_id": "u001"},
        {"level": "error", "message": "Payment failed", "code": 500},
        {"level": "info", "message": "Order placed", "order_id": "o123"},
    ]