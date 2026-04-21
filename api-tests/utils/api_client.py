import base64
import requests

from utils.config import BASE_URL, ORG, USERNAME, PASSWORD


class OpenObserveClient:
    def __init__(self) -> None:
        credentials = base64.b64encode(
            f"{USERNAME}:{PASSWORD}".encode("utf-8")
        ).decode("utf-8")

        self.headers = {
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json",
        }

    def ingest_logs(self, stream_name: str, payload: list[dict]) -> requests.Response:
        url = f"{BASE_URL}/api/{ORG}/{stream_name}/_json"
        return requests.post(url=url, headers=self.headers, json=payload, timeout=30)

    def search_logs(
        self,
        stream_name: str,
        start_time: int,
        end_time: int,
        size: int = 100,
    ) -> requests.Response:
        url = f"{BASE_URL}/api/{ORG}/_search?type=logs"
        body = {
            "query": {
                "sql": f'SELECT * FROM "{stream_name}"',
                "start_time": start_time,
                "end_time": end_time,
                "from": 0,
                "size": size,
            }
        }
        return requests.post(url=url, headers=self.headers, json=body, timeout=30)