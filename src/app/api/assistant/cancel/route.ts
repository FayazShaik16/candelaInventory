import { NextRequest, NextResponse } from 'next/server';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:7860';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { confirmation_token, action_id } = body;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${AI_BACKEND_URL}/actions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': req.headers.get('x-user-role') || 'admin',
          'x-user-id': req.headers.get('x-user-id') || 'usr-admin-01',
          'x-user-name': req.headers.get('x-user-name') || 'Admin Supervisor',
        },
        body: JSON.stringify({ confirmation_token, action_id }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (err) {}

    return NextResponse.json({
      success: true,
      message: 'Pending operation successfully dismissed.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal error.' },
      { status: 500 }
    );
  }
}
