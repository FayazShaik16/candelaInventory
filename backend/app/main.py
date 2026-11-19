import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .schemas.responses import HealthResponse
from .api import chat, confirmations, conversations

# Configure structured logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("candela-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Initializing %s v%s in %s environment...", settings.APP_NAME, settings.APP_VERSION, settings.ENVIRONMENT)
    logger.info("Target AI Model: %s (Hugging Face Spaces Port %s)", settings.HF_MODEL_REPO, settings.PORT)
    logger.info("Configured CORS Allowed Origins: %s", settings.CORS_ORIGINS)
    yield
    # Shutdown logic
    logger.info("Shutting down %s gracefully...", settings.APP_NAME)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production Conversational AI Assistant Backend for Candela Inventory Management Platform.",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(chat.router)
app.include_router(confirmations.router)
app.include_router(conversations.router)

@app.get("/", tags=["system"])
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "documentation": "/docs",
        "model": settings.HF_MODEL_REPO,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check():
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        ai_model=settings.HF_MODEL_REPO,
        supabase_connected=True,
        active_conversations=len(conversations.USER_CONVERSATIONS)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
