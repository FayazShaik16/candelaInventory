# Candela Inventory Management Platform — Hugging Face Spaces Deployment Guide

## 1. Space Architecture

The AI Assistant runs as a containerized Python FastAPI service on Hugging Face Spaces:
- **Port:** Standard `7860` (Hardcoded requirement for Hugging Face Spaces Docker SDK).
- **User:** Non-root Linux user `user` with UID `1000`.
- **Model:** Instruction-tuned LLM (e.g. `meta-llama/Llama-3.2-3B-Instruct`) through Hugging Face Inference API, with built-in local rule-based entity and intent fallback.

---

## 2. Docker Configuration

`backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

`backend/README.md`:
```yaml
---
title: Candela Inventory AI Assistant Backend
emoji: 🛰️
colorFrom: green
colorTo: emerald
sdk: docker
app_port: 7860
pinned: false
---
```

---

## 3. Deployment Steps on Hugging Face

1. Create a new Space on [Hugging Face](https://huggingface.co/new-space).
2. Space Name: `candela-inventory-ai`.
3. License: `mit` or `proprietary`.
4. SDK: Select **Docker** -> **Blank**.
5. Set Space Hardware:
   - Free tier: 2 vCPU, 16 GB RAM (sufficient with HF API or local rule parser).
   - Upgraded tier: T4 small or A10G (for locally hosted weights).
6. Push repository contents to Hugging Face Git remote:
   ```bash
   git clone https://huggingface.co/spaces/<your-username>/candela-inventory-ai hf-space
   cp -r backend/* hf-space/
   cd hf-space
   git add .
   git commit -m "feat: deploy Candela AI assistant backend"
   git push
   ```
7. Configure Secrets under **Settings** -> **Variables and Secrets**:
   - `HF_API_KEY`: User Access Token with read permissions.
   - `CONFIRMATION_SECRET`: Secure cryptographic HMAC salt.
   - `ALLOWED_ORIGINS`: Comma-separated list of production frontend origins.
   - `ENVIRONMENT`: `production`.
   - `LOG_LEVEL`: `info`.

---

## 4. Cold Start & Offline Resilience
Hugging Face Spaces may sleep after 48 hours of inactivity on the free tier.
The Candela frontend handles this seamlessly:
- If the Space is sleeping or booting, requests timeout after 4 seconds and automatically degrade to the **Local Intelligence Fallback Engine**.
- All inventory queries and action preview cards continue to render cleanly.
- The assistant panel header shows `Local Engine` until the Space awakens and responds with `AI Engine Connected`.
