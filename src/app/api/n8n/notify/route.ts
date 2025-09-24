import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const url = process.env.N8N_NOTIFY_URL;
    if (!url) {
      return NextResponse.json({ error: 'N8N_NOTIFY_URL is not set' }, { status: 500 });
    }
    const payload = await req.json().catch(() => ({}));
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_NOTIFY_SECRET ? { 'X-Webhook-Secret': process.env.N8N_NOTIFY_SECRET } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'n8n error', details: text }, { status: 502 });
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


