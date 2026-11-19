from typing import Dict, Any, List
from datetime import datetime, timezone

class AuditService:
    def __init__(self):
        self.logs: List[Dict[str, Any]] = []

    def record_event(
        self,
        action_type: str,
        performed_by: str,
        description: str,
        inventory_type: str = None,
        inventory_id: str = None,
        inventory_tag: str = None,
        employee_id: str = None,
        previous_values: Dict[str, Any] = None,
        new_values: Dict[str, Any] = None
    ) -> str:
        log_id = f"ACT-AI-{len(self.logs) + 1:04d}"
        entry = {
            "id": log_id,
            "action_type": action_type,
            "performed_by": performed_by,
            "description": description,
            "inventory_type": inventory_type,
            "inventory_id": inventory_id,
            "inventory_tag": inventory_tag,
            "employee_id": employee_id,
            "previous_values": previous_values or {},
            "new_values": new_values or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.logs.insert(0, entry)
        return log_id

audit_service = AuditService()
