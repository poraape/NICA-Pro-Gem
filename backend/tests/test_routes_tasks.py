from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


class DummyAsyncResult:
    def __init__(self, status: str, result=None):
        self._status = status
        self.result = result

    def successful(self):
        return self._status == "SUCCESS"

    @property
    def status(self):
        return self._status


def test_enqueue_plan(monkeypatch):
    class DummyTask:
        def __init__(self):
            self.id = "task-1"

    def fake_delay(payload):
        return DummyTask()

    monkeypatch.setattr("app.api.routes.tasks.generate_plan_task.delay", fake_delay)

    resp = client.post(
        "/api/agents/plan",
        json={
            "profile": {
                "id": "u1",
                "language": "en",
                "onboardingMode": "express",
                "name": "User",
                "biometrics": {},
                "clinical": {},
                "lifestyle": {},
                "routine": {},
                "goals": {},
                "consent": {},
            }
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["task_id"] == "task-1"


def test_plan_status_success(monkeypatch):
    result_data = {"task_id": "task-1", "status": "success"}
    monkeypatch.setattr("app.api.routes.tasks.AsyncResult", lambda _id: DummyAsyncResult("SUCCESS", result_data))

    resp = client.get("/api/agents/plan/task-1")
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"


def test_plan_status_pending(monkeypatch):
    monkeypatch.setattr("app.api.routes.tasks.AsyncResult", lambda _id: DummyAsyncResult("PENDING"))

    resp = client.get("/api/agents/plan/task-2")
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending"
