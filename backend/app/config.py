import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Candela Inventory AI Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = int(os.getenv("PORT", "7860"))

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", os.getenv("SUPABASE_URL", "http://localhost:54321"))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-key")
    SUPABASE_ANON_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", os.getenv("SUPABASE_ANON_KEY", "placeholder-anon-key"))
    JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "candela-secret-jwt-key")

    # Hugging Face Model Configuration
    HF_API_KEY: str = os.getenv("HF_API_KEY", "")
    HF_MODEL_REPO: str = os.getenv("HF_MODEL_REPO", "meta-llama/Llama-3.2-3B-Instruct")
    HF_API_URL: str = os.getenv("HF_API_URL", "https://api-inference.huggingface.co/models/")

    # OpenRouter Model Configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    # Security & Idempotency
    CONFIRMATION_SECRET: str = os.getenv("CONFIRMATION_SECRET", "candela-secure-confirmation-salt-2026")
    CONFIRMATION_EXPIRY_SECONDS: int = 300  # 5 minutes
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://candela-inventory.vercel.app"
            if os.getenv("ENVIRONMENT") == "production"
            else "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://candela-inventory.vercel.app,*"
        ).split(",")
        if origin.strip()
    ]

    model_config = ConfigDict(env_file=".env", extra="allow")

settings = Settings()
