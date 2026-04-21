import time


def test_log_ingestion_and_search(client, unique_stream, sample_logs):
    ingest_response = client.ingest_logs(unique_stream, sample_logs)
    assert ingest_response.status_code == 200, (
        f"Ingestion failed. Status: {ingest_response.status_code}, "
        f"Response: {ingest_response.text}"
    )

    time.sleep(5)

    end_time = int(time.time() * 1_000_000)
    start_time = end_time - (60 * 60 * 1_000_000)

    search_response = client.search_logs(unique_stream, start_time, end_time)
    assert search_response.status_code == 200, (
        f"Search failed. Status: {search_response.status_code}, "
        f"Response: {search_response.text}"
    )

    response_json = search_response.json()
    print(response_json)

    assert response_json["total"] >= 3
    assert len(response_json["hits"]) >= 3

    messages = [item.get("message") for item in response_json["hits"]]

    assert "User logged in" in messages
    assert "Payment failed" in messages
    assert "Order placed" in messages