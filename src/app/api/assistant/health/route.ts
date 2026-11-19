import { NextResponse } from 'next/server';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:7860';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${AI_BACKEND_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        connected: true,
        backend: 'FastAPI / HF Spaces',
        version: data.version,
        model: data.ai_model,
      });
    }
  } catch (err) {}

  if (process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({
      connected: true,
      backend: 'OpenRouter Cloud API',
      version: '1.0.0',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    });
  }

  return NextResponse.json({
    connected: false,
    backend: 'Client / Serverless Local Intelligence',
    version: '1.0.0',
    model: 'Candela Edge Rule Engine',
  });
}
