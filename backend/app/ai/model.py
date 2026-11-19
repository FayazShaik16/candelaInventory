import json
import re
import logging
from typing import Dict, Any, Optional
import httpx
from ..config import settings
from .prompts import SYSTEM_PROMPT
from .intent_classifier import intent_classifier
from ..schemas.actions import StructuredAIOutput

logger = logging.getLogger(__name__)

class AIModelClient:
    def __init__(self):
        self.openrouter_api_key = settings.OPENROUTER_API_KEY
        self.openrouter_model = settings.OPENROUTER_MODEL
        self.openrouter_url = f"{settings.OPENROUTER_BASE_URL.rstrip('/')}/chat/completions"
        self.hf_api_key = settings.HF_API_KEY
        self.hf_model_repo = settings.HF_MODEL_REPO
        self.hf_api_url = f"{settings.HF_API_URL}{self.hf_model_repo}"

    async def parse_instruction(self, message: str, context_tag: Optional[str] = None) -> StructuredAIOutput:
        """
        Parses natural-language user message into typed StructuredAIOutput.
        1. Attempts OpenRouter if OPENROUTER_API_KEY is configured.
        2. Attempts Hugging Face Inference API if HF_API_KEY is configured.
        3. Falls back reliably to deterministic Candela entity & intent rule engine.
        """
        # 1. OpenRouter Integration
        if self.openrouter_api_key:
            try:
                headers = {
                    "Authorization": f"Bearer {self.openrouter_api_key}",
                    "HTTP-Referer": "https://candela-inventory.vercel.app",
                    "X-Title": "Candela Inventory AI Assistant",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.openrouter_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Instruction: {message}\nContext Tag: {context_tag or 'None'}"}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1
                }
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.post(self.openrouter_url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"]
                        json_match = re.search(r'\{.*\}', content, re.DOTALL)
                        if json_match:
                            parsed_json = json.loads(json_match.group(0))
                            return StructuredAIOutput(**parsed_json)
            except Exception as e:
                logger.warning(f"OpenRouter inference failed: {e}. Falling back...")

        # 2. Hugging Face Inference Integration
        if self.hf_api_key:
            try:
                headers = {"Authorization": f"Bearer {self.hf_api_key}"}
                payload = {
                    "inputs": f"{SYSTEM_PROMPT}\nUser instruction: {message}\nJSON output:",
                    "parameters": {"max_new_tokens": 250, "return_full_text": False}
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(self.hf_api_url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        generated = data[0].get("generated_text", "")
                        json_match = re.search(r'\{.*\}', generated, re.DOTALL)
                        if json_match:
                            parsed_json = json.loads(json_match.group(0))
                            return StructuredAIOutput(**parsed_json)
            except Exception as e:
                logger.warning(f"HF API inference error, falling back to local classifier: {e}")

        # 3. Local deterministic classifier & entity extraction engine
        return intent_classifier.classify_and_extract(message, context_tag)

ai_model = AIModelClient()
