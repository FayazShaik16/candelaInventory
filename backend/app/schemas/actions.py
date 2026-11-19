from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

IntentType = Literal[
    "inventory_query",
    "inventory_create",
    "inventory_update",
    "location_update",
    "model_update",
    "radio_configuration_update",
    "equipment_assignment",
    "equipment_return",
    "equipment_transfer",
    "status_update",
    "employee_inventory_query",
    "assignment_history_query",
    "current_custodian_query",
    "client_specs_query"
]

CategoryType = Literal["lanforge", "desktop", "mobile", "chamber"]
GlobalStatusType = Literal["Available", "In-Use", "Under Maintenance"]
LANforgeLocationType = Literal["VINSR", "OPEL", "GVP"]

class RadioOperationDTO(BaseModel):
    operation: Literal["add", "set_quantity", "remove"]
    chipset: str
    quantity: int = 1

class FieldChangeDTO(BaseModel):
    field: str
    from_value: Optional[Any] = Field(None, alias="from")
    to_value: Any = Field(..., alias="to")

    model_config = ConfigDict(populate_by_name=True)

class ActionPreviewDTO(BaseModel):
    id: str
    intent: IntentType
    category: CategoryType
    record_identifier: str
    title: str
    description: str
    changes: List[FieldChangeDTO] = []
    requires_confirmation: bool = True
    confirmation_token: Optional[str] = None
    expires_at: Optional[str] = None
    payload: Dict[str, Any] = {}

class QueryResultItemDTO(BaseModel):
    id: str
    tag: str
    model: str
    category: CategoryType
    status: GlobalStatusType
    location: Optional[str] = None
    custodian: Optional[str] = None
    details: Dict[str, Any] = {}

class StructuredAIOutput(BaseModel):
    intent: IntentType
    category: Optional[CategoryType] = None
    record_identifier: Optional[str] = None
    employee_name: Optional[str] = None
    target_status: Optional[GlobalStatusType] = None
    location: Optional[LANforgeLocationType] = None
    project: Optional[str] = None
    testbed_ip: Optional[str] = None
    radio_operations: List[RadioOperationDTO] = []
    client_counts: Optional[Dict[str, int]] = None
    notes: Optional[str] = None
    query_filters: Optional[Dict[str, Any]] = None
    requires_confirmation: bool = False
    confidence: float = 1.0
