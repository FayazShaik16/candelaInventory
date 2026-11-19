from typing import Optional, Dict, Any, Tuple
from .inventory_service import repo
from .assignment_service import assignment_service

class ValidationService:
    @staticmethod
    def resolve_equipment(identifier: str, category: Optional[str] = None) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        """
        Attempts to resolve an equipment item by identifier or model across all 4 categories.
        """
        if category == "lanforge" or not category:
            item = repo.find_lanforge(identifier)
            if item:
                return "lanforge", item
        
        if category == "desktop" or not category:
            item = repo.find_desktop(identifier)
            if item:
                return "desktop", item
        
        if category == "mobile" or not category:
            item = repo.find_mobile(identifier)
            if item:
                return "mobile", item
        
        if category == "chamber" or not category:
            item = repo.find_chamber(identifier)
            if item:
                return "chamber", item
        
        return None, None

    @staticmethod
    def validate_assignment_preconditions(category: str, item: Dict[str, Any], employee_name: str) -> Dict[str, Any]:
        """
        Enforces all assignment rules: employee existence & active status, maintenance check, duplicate active check.
        """
        emp = repo.find_employee(employee_name)
        if not emp:
            return {"valid": False, "error": f"Employee '{employee_name}' was not found in Candela directory."}
        
        if emp.get("account_status") != "active":
            return {"valid": False, "error": f"Cannot assign equipment to {emp['full_name']} because account status is inactive."}
        
        if item.get("status") == "Under Maintenance":
            return {"valid": False, "error": f"Cannot assign {item.get('lanforge_id') or item.get('device_id') or item.get('chamber_id')} because it is currently marked Under Maintenance."}
        
        active_asgn = assignment_service.get_active_assignment(category, item["id"])
        if active_asgn:
            return {
                "valid": False, 
                "error": f"Equipment already has an active assignment under {active_asgn['employee_name']}. Please transfer or return it first.",
                "active_assignment": active_asgn
            }
        
        return {"valid": True, "employee": emp}

validation_service = ValidationService()
