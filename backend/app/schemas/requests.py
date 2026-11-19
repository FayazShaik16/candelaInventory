from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context_unit_tag: Optional[str] = None

class ActionConfirmRequest(BaseModel):
    confirmation_token: str
    action_id: Optional[str] = None
    user_confirmed: bool = True

class ActionCancelRequest(BaseModel):
    confirmation_token: Optional[str] = None
    action_id: Optional[str] = None

class NewConversationRequest(BaseModel):
    title: Optional[str] = "Hardware Operations Session"
