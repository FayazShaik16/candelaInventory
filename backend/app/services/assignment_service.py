from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from .inventory_service import repo

INITIAL_ASSIGNMENTS = [
    {
        "id": "asgn-01",
        "inventory_type": "lanforge",
        "inventory_id": "lf-01",
        "inventory_tag": "LF-521B-001",
        "employee_id": "usr-emp-02",
        "employee_name": "Sarah Chen",
        "assigned_at": "2026-08-10T10:00:00Z",
        "returned_at": "2026-10-15T16:00:00Z",
        "assigned_by": "Alex Mercer",
        "returned_by": "Alex Mercer",
        "assignment_status": "returned",
        "notes": "Initial 802.11ax throughput benchmark."
    },
    {
        "id": "asgn-02",
        "inventory_type": "lanforge",
        "inventory_id": "lf-01",
        "inventory_tag": "LF-521B-001",
        "employee_id": "usr-emp-01",
        "employee_name": "Fayaz Ahmed",
        "assigned_at": "2026-11-01T09:00:00Z",
        "returned_at": None,
        "assigned_by": "Alex Mercer",
        "returned_by": None,
        "assignment_status": "active",
        "notes": "Active dual-radio Wi-Fi 6E stress test matrix."
    },
    {
        "id": "asgn-03",
        "inventory_type": "lanforge",
        "inventory_id": "lf-02",
        "inventory_tag": "LF-523C-002",
        "employee_id": "usr-emp-03",
        "employee_name": "Elena Rostova",
        "assigned_at": "2026-09-01T08:30:00Z",
        "returned_at": "2026-11-05T12:00:00Z",
        "assigned_by": "Alex Mercer",
        "returned_by": "Alex Mercer",
        "assignment_status": "returned",
        "notes": "Wi-Fi 7 320MHz MLO latency validation."
    },
    {
        "id": "asgn-04",
        "inventory_type": "desktop",
        "inventory_id": "dt-01",
        "inventory_tag": "DT-DELL-01",
        "employee_id": "usr-emp-01",
        "employee_name": "Fayaz Ahmed",
        "assigned_at": "2026-11-02T10:00:00Z",
        "returned_at": None,
        "assigned_by": "Alex Mercer",
        "returned_by": None,
        "assignment_status": "active",
        "notes": "Continuous Controller Automation rig."
    },
    {
        "id": "asgn-05",
        "inventory_type": "mobile",
        "inventory_id": "mb-01",
        "inventory_tag": "MOB-PIXEL-01",
        "employee_id": "usr-emp-02",
        "employee_name": "Sarah Chen",
        "assigned_at": "2026-11-03T11:00:00Z",
        "returned_at": None,
        "assigned_by": "Alex Mercer",
        "returned_by": None,
        "assignment_status": "active",
        "notes": "Mobile Fleet Multi-Station Roaming Suite."
    },
    {
        "id": "asgn-06",
        "inventory_type": "chamber",
        "inventory_id": "ch-01",
        "inventory_tag": "CH-ISO-01",
        "employee_id": "usr-emp-01",
        "employee_name": "Fayaz Ahmed",
        "assigned_at": "2026-11-04T12:00:00Z",
        "returned_at": None,
        "assigned_by": "Alex Mercer",
        "returned_by": None,
        "assignment_status": "active",
        "notes": "Wi-Fi 6E High-Throughput RF Isolation."
    }
]

class AssignmentService:
    def __init__(self):
        self.assignments = list(INITIAL_ASSIGNMENTS)

    def get_active_assignment(self, inventory_type: str, inventory_id: str) -> Optional[Dict[str, Any]]:
        for a in self.assignments:
            if a["inventory_type"] == inventory_type and a["inventory_id"] == inventory_id and a["assignment_status"] == "active":
                return a
        return None

    def get_equipment_history(self, inventory_id: str) -> List[Dict[str, Any]]:
        return [a for a in self.assignments if a["inventory_id"] == inventory_id]

    def get_employee_assignments(self, employee_id: str) -> List[Dict[str, Any]]:
        return [a for a in self.assignments if a["employee_id"] == employee_id]

    def assign(self, inventory_type: str, inventory_id: str, tag: str, employee_id: str, employee_name: str, assigned_by: str, notes: str = "") -> Dict[str, Any]:
        existing = self.get_active_assignment(inventory_type, inventory_id)
        if existing:
            raise ValueError(f"Equipment already has an active assignment under {existing['employee_name']}.")

        new_asgn = {
            "id": f"asgn-{len(self.assignments)+1}",
            "inventory_type": inventory_type,
            "inventory_id": inventory_id,
            "inventory_tag": tag,
            "employee_id": employee_id,
            "employee_name": employee_name,
            "assigned_at": datetime.now(timezone.utc).isoformat(),
            "returned_at": None,
            "assigned_by": assigned_by,
            "returned_by": None,
            "assignment_status": "active",
            "notes": notes
        }
        self.assignments.insert(0, new_asgn)
        return new_asgn

    def return_eq(self, inventory_type: str, inventory_id: str, returned_by: str, notes: str = "") -> bool:
        active = self.get_active_assignment(inventory_type, inventory_id)
        if not active:
            raise ValueError("No active assignment found for this equipment.")

        active["assignment_status"] = "returned"
        active["returned_at"] = datetime.now(timezone.utc).isoformat()
        active["returned_by"] = returned_by
        if notes:
            active["notes"] = f"{active['notes']} | Return: {notes}" if active["notes"] else f"Return: {notes}"
        return True

    def transfer(self, inventory_type: str, inventory_id: str, tag: str, to_employee_id: str, to_employee_name: str, transferred_by: str, notes: str = "") -> Dict[str, Any]:
        active = self.get_active_assignment(inventory_type, inventory_id)
        if not active:
            raise ValueError("No active assignment found to transfer.")
        if active["employee_id"] == to_employee_id:
            raise ValueError("Equipment is already assigned to this employee.")

        # 1. Close current
        active["assignment_status"] = "transferred"
        active["returned_at"] = datetime.now(timezone.utc).isoformat()
        active["returned_by"] = transferred_by
        active["notes"] = f"{active['notes']} | Transferred to {to_employee_name}: {notes}"

        # 2. Open new
        new_asgn = {
            "id": f"asgn-{len(self.assignments)+1}",
            "inventory_type": inventory_type,
            "inventory_id": inventory_id,
            "inventory_tag": tag,
            "employee_id": to_employee_id,
            "employee_name": to_employee_name,
            "assigned_at": datetime.now(timezone.utc).isoformat(),
            "returned_at": None,
            "assigned_by": transferred_by,
            "returned_by": None,
            "assignment_status": "active",
            "notes": f"Transferred from {active['employee_name']}. {notes}"
        }
        self.assignments.insert(0, new_asgn)
        return new_asgn

assignment_service = AssignmentService()
