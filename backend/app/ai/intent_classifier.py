import re
from typing import Dict, Any
from .entity_extractor import entity_extractor
from ..schemas.actions import StructuredAIOutput

class IntentClassifier:
    @staticmethod
    def classify_and_extract(text: str, context_tag: str = None) -> StructuredAIOutput:
        text_lower = text.lower().strip()

        entities = entity_extractor.extract_identifiers(text)
        record_id = entities.get("record_identifier") or context_tag
        category = entities.get("category")
        employee = entity_extractor.extract_employee_name(text)
        status_target = entity_extractor.extract_status(text)
        location = entity_extractor.extract_location(text)
        radio_ops = entity_extractor.extract_radio_operations(text)

        # 1. Assignment History / Previous User Query
        if "who previously" in text_lower or "previous user" in text_lower or "previously used" in text_lower or "history" in text_lower:
            return StructuredAIOutput(
                intent="assignment_history_query",
                category=category,
                record_identifier=record_id,
                requires_confirmation=False
            )

        # 2. Current Custodian Query (e.g. "Who is currently using MOB002?", "Who is using CT521B?")
        if ("who is" in text_lower or "currently using" in text_lower or "who uses" in text_lower or "current user" in text_lower) and record_id:
            return StructuredAIOutput(
                intent="current_custodian_query",
                category=category,
                record_identifier=record_id,
                requires_confirmation=False
            )

        # 3. Client Specs Query (e.g. "How many 11be clients does CT523C have?")
        if any(k in text_lower for k in ["how many 11", "how many clients", "11be clients", "11ax clients", "11ac clients", "11n clients"]) and record_id:
            return StructuredAIOutput(
                intent="client_specs_query",
                category="lanforge",
                record_identifier=record_id,
                requires_confirmation=False
            )

        # 4. Location Update (e.g. "Change CT521A location to OPEL", "Move LF-01 to GVP")
        if location and record_id and any(k in text_lower for k in ["location", "move", "relocate", "change", "set"]):
            return StructuredAIOutput(
                intent="location_update",
                category=category or "lanforge",
                record_identifier=record_id,
                location=location,
                requires_confirmation=True
            )

        # 5. Model Update (e.g. "Update the model of MOB001")
        if "model" in text_lower and any(k in text_lower for k in ["update", "change", "set", "modify"]) and record_id:
            return StructuredAIOutput(
                intent="model_update",
                category=category,
                record_identifier=record_id,
                requires_confirmation=True
            )

        # 6. Employee Assigned Equipment Query
        if "assigned to me" in text_lower or "my equipment" in text_lower or ("assigned" in text_lower and any(q in text_lower for q in ["show", "which", "list", "what", "who", "where"])):
            return StructuredAIOutput(
                intent="employee_inventory_query",
                category=category,
                employee_name=employee,
                requires_confirmation=False
            )

        # 7. Radio Configuration Update
        if radio_ops or ("radio" in text_lower and ("has" in text_lower or "add" in text_lower or "update" in text_lower or "set" in text_lower)):
            return StructuredAIOutput(
                intent="radio_configuration_update",
                category="lanforge",
                record_identifier=record_id,
                radio_operations=radio_ops,
                requires_confirmation=True
            )

        # 8. Equipment Transfer
        if "transfer" in text_lower or "reassign" in text_lower:
            return StructuredAIOutput(
                intent="equipment_transfer",
                category=category,
                record_identifier=record_id,
                employee_name=employee,
                requires_confirmation=True
            )

        # 9. Equipment Return
        if "return" in text_lower or "check in" in text_lower or "check-in" in text_lower:
            return StructuredAIOutput(
                intent="equipment_return",
                category=category,
                record_identifier=record_id,
                requires_confirmation=True
            )

        # 10. Equipment Assignment
        if ("assign" in text_lower or "give" in text_lower or "used by" in text_lower or "allocated to" in text_lower) and employee:
            return StructuredAIOutput(
                intent="equipment_assignment",
                category=category,
                record_identifier=record_id,
                employee_name=employee,
                requires_confirmation=True
            )

        # 11. Status Update (e.g. "Mark DESK001 as under maintenance", "Set DESK-003 to Under Maintenance")
        if (any(k in text_lower for k in ["mark", "set", "change", "update", "switch", "shift"]) and status_target) or (status_target and record_id and "is" not in text_lower and "?" not in text_lower):
            return StructuredAIOutput(
                intent="status_update",
                category=category,
                record_identifier=record_id,
                target_status=status_target,
                requires_confirmation=True
            )

        # 12. General Inventory Query (e.g. "How many LANforges are available?", "Show all chambers")
        if any(w in text_lower for w in ["show", "how many", "list", "find", "which", "available", "where", "status"]):
            return StructuredAIOutput(
                intent="inventory_query",
                category=category,
                record_identifier=record_id,
                target_status=status_target,
                location=location,
                requires_confirmation=False
            )

        # Default fallback to inventory query
        return StructuredAIOutput(
            intent="inventory_query",
            category=category,
            record_identifier=record_id,
            requires_confirmation=False
        )

intent_classifier = IntentClassifier()
