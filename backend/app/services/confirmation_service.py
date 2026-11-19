import hmac
import hashlib
import time
import json
from typing import Dict, Any, Optional
from ..config import settings

class ConfirmationService:
    def __init__(self):
        self.pending_actions: Dict[str, Dict[str, Any]] = {}
        self.used_tokens: set = set()

    def create_confirmation_token(self, action_id: str, payload: Dict[str, Any]) -> str:
        timestamp = int(time.time())
        data_string = f"{action_id}:{timestamp}:{json.dumps(payload, sort_keys=True)}"
        signature = hmac.new(
            settings.CONFIRMATION_SECRET.encode("utf-8"),
            data_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        token = f"{action_id}.{timestamp}.{signature}"
        self.pending_actions[token] = {
            "action_id": action_id,
            "payload": payload,
            "created_at": timestamp,
            "expires_at": timestamp + settings.CONFIRMATION_EXPIRY_SECONDS
        }
        return token

    def verify_and_consume_token(self, token: str) -> Optional[Dict[str, Any]]:
        if not token or token in self.used_tokens:
            return None
        
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        action_id, timestamp_str, provided_sig = parts
        try:
            timestamp = int(timestamp_str)
        except ValueError:
            return None

        # Expiry check
        if time.time() > timestamp + settings.CONFIRMATION_EXPIRY_SECONDS:
            return None

        cached = self.pending_actions.get(token)
        if not cached:
            return None

        # Verify signature against cached payload
        data_string = f"{action_id}:{timestamp}:{json.dumps(cached['payload'], sort_keys=True)}"
        expected_sig = hmac.new(
            settings.CONFIRMATION_SECRET.encode("utf-8"),
            data_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        # Mark consumed (single-use idempotency control)
        self.used_tokens.add(token)
        del self.pending_actions[token]
        return cached["payload"]

    def cancel_token(self, token: str):
        if token in self.pending_actions:
            del self.pending_actions[token]
        self.used_tokens.add(token)

confirmation_service = ConfirmationService()
