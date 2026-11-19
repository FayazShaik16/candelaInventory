import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.inventory_service import repo
from backend.app.services.confirmation_service import confirmation_service

client = TestClient(app)

ADMIN_HEADERS = {
    "x-user-id": "usr-admin-001",
    "x-user-email": "admin@candelatech.com",
    "x-user-role": "admin",
    "x-user-name": "Admin Supervisor"
}

EMPLOYEE_HEADERS = {
    "x-user-id": "usr-emp-002",
    "x-user-email": "rahul.v@candelatech.com",
    "x-user-role": "employee",
    "x-user-name": "Rahul Verma"
}

def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "ai_model" in data

def test_inventory_query_lanforges():
    resp = client.post(
        "/chat",
        json={"message": "Show all LANforges at VINSR"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data["text"].lower() or data["query_results"] is not None
    assert len(data["query_results"]) > 0
    assert any("LF-" in item["tag"] for item in data["query_results"])

def test_inventory_query_employee_equipment():
    resp = client.post(
        "/chat",
        json={"message": "What equipment is currently assigned to Priya Sharma?"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "priya" in data["text"].lower() or len(data["query_results"]) > 0

def test_action_preview_assignment():
    resp = client.post(
        "/chat",
        json={"message": "Assign LF-002 to Rahul Verma"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    data = resp.json()
    preview = data["action_preview"]
    assert preview is not None
    assert preview["intent"] == "equipment_assignment"
    assert "002" in preview["record_identifier"]
    assert preview["confirmation_token"] is not None
    assert preview["requires_confirmation"] is True

def test_confirm_action_lifecycle():
    # 1. Generate preview for status change
    resp = client.post(
        "/chat",
        json={"message": "Set DESK-003 to Under Maintenance"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    preview = resp.json()["action_preview"]
    assert preview is not None
    token = preview["confirmation_token"]

    # 2. Confirm action
    confirm_resp = client.post(
        "/actions/confirm",
        json={"confirmation_token": token},
        headers=ADMIN_HEADERS
    )
    assert confirm_resp.status_code == 200
    res = confirm_resp.json()
    assert res["success"] is True
    assert "Under Maintenance" in res["message"]

    # 3. Idempotency test: Re-submitting the same token MUST fail
    replay_resp = client.post(
        "/actions/confirm",
        json={"confirmation_token": token},
        headers=ADMIN_HEADERS
    )
    assert replay_resp.status_code == 400
    assert "expired" in replay_resp.json()["detail"].lower() or "invalid" in replay_resp.json()["detail"].lower()

def test_radio_configuration_preview_and_confirm():
    # 1. Ask to update radio configuration
    resp = client.post(
        "/chat",
        json={"message": "Add 2 Intel AX210 radios to LF-001"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    preview = resp.json()["action_preview"]
    assert preview is not None
    assert preview["intent"] == "radio_configuration_update"
    token = preview["confirmation_token"]

    # 2. Confirm radio update
    confirm_resp = client.post(
        "/actions/confirm",
        json={"confirmation_token": token},
        headers=ADMIN_HEADERS
    )
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["success"] is True

def test_action_cancel():
    resp = client.post(
        "/chat",
        json={"message": "Assign MOB-002 to Sneha Patel"},
        headers=ADMIN_HEADERS
    )
    preview = resp.json()["action_preview"]
    assert preview is not None
    token = preview["confirmation_token"]

    cancel_resp = client.post(
        "/actions/cancel",
        json={"confirmation_token": token},
        headers=ADMIN_HEADERS
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["success"] is True

    # Token cannot be used after cancellation
    confirm_resp = client.post(
        "/actions/confirm",
        json={"confirmation_token": token},
        headers=ADMIN_HEADERS
    )
    assert confirm_resp.status_code == 400

def test_employee_cannot_mutate():
    # 1. Generate preview
    resp = client.post(
        "/chat",
        json={"message": "Set DESK-001 to Under Maintenance"},
        headers=ADMIN_HEADERS
    )
    token = resp.json()["action_preview"]["confirmation_token"]

    # 2. Employee attempts to confirm -> Forbidden
    confirm_resp = client.post(
        "/actions/confirm",
        json={"confirmation_token": token},
        headers=EMPLOYEE_HEADERS
    )
    assert confirm_resp.status_code == 403
    assert "Administrator privilege" in confirm_resp.json()["detail"]

def test_equipment_transfer_preview_and_confirm():
    resp = client.post(
        "/chat",
        json={"message": "Transfer LF-001 to Sarah Chen"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    preview = resp.json()["action_preview"]
    assert preview is not None
    assert preview["intent"] == "equipment_transfer"
    token = preview["confirmation_token"]

    confirm_resp = client.post(
        "/actions/confirm",
        json={"confirmation_token": token},
        headers=ADMIN_HEADERS
    )
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["success"] is True

def test_equipment_return_preview_and_confirm():
    resp = client.post(
        "/chat",
        json={"message": "Return MOB-001 from Sarah Chen"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    preview = resp.json()["action_preview"]
    assert preview is not None
    assert preview["intent"] == "equipment_return"
    token = preview["confirmation_token"]

    confirm_resp = client.post(
        "/actions/confirm",
        json={"confirmation_token": token},
        headers=ADMIN_HEADERS
    )
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["success"] is True

def test_assign_under_maintenance_rejected():
    # DESK-003 was set to Under Maintenance in earlier test
    resp = client.post(
        "/chat",
        json={"message": "Assign DESK-003 to Rahul Verma"},
        headers=ADMIN_HEADERS
    )
    assert resp.status_code == 200
    # Must reject without creating confirmation preview
    assert resp.json()["action_preview"] is None
    assert "maintenance" in resp.json()["text"].lower()

