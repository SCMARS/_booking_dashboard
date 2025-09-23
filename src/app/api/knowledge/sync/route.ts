import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = process.env.N8N_SYNC_URL;
    const key = process.env.N8N_API_KEY;
    if (!url) return NextResponse.json({ error: 'N8N_SYNC_URL not set' }, { status: 400 });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-API-Key': key } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


