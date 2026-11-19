from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from ..schemas.requests import NewConversationRequest
from ..security.authentication import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/conversations", tags=["conversations"])

USER_CONVERSATIONS: Dict[str, List[Dict[str, Any]]] = {}

@router.get("")
async def list_conversations(user: AuthenticatedUser = Depends(get_current_user)):
    user_convs = USER_CONVERSATIONS.get(user.user_id, [
        {"id": "conv-default", "title": "Hardware Operations Session", "created_at": "Today"}
    ])
    return {"conversations": user_convs}

@router.post("")
async def create_conversation(req: NewConversationRequest, user: AuthenticatedUser = Depends(get_current_user)):
    new_id = f"conv-{len(USER_CONVERSATIONS.get(user.user_id, [])) + 1}"
    new_item = {"id": new_id, "title": req.title, "created_at": "Just now"}
    
    if user.user_id not in USER_CONVERSATIONS:
        USER_CONVERSATIONS[user.user_id] = []
    USER_CONVERSATIONS[user.user_id].insert(0, new_item)
    return new_item
