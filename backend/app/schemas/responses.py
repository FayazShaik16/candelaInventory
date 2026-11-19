from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from .actions import ActionPreviewDTO, QueryResultItemDTO

class ChatMessageResponse(BaseModel):
    message_id: str
    conversation_id: str
    sender: str = "assistant"
    timestamp: str
    text: str
    action_preview: Optional[ActionPreviewDTO] = None
    query_results: Optional[List[QueryResultItemDTO]] = None
    clarification_options: Optional[List[str]] = None
    status: str = "success"

class ActionExecutionResult(BaseModel):
    success: bool
    message: str
    action_id: Optional[str] = None
    updated_record: Optional[Dict[str, Any]] = None
    audit_log_id: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    ai_model: str
    supabase_connected: bool
    active_conversations: int
