import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// n8n → POST /api/n8n/bookings
// Optional header X-Webhook-Secret must match NEXT_PUBLIC_N8N_WEBHOOK_SECRET (or N8N_WEBHOOK_SECRET)

export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-webhook-secret') || '';
    const expected = process.env.NEXT_PUBLIC_N8N_WEBHOOK_SECRET || process.env.N8N_WEBHOOK_SECRET || '';
    if (expected && secret !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const docData = {
      name: (body.name || '').toString(),
      date: (body.date || '').toString(),
      status: (body.status || 'Pending').toString(),
      channel: (body.channel || 'Website').toString(),
      // passthrough
      source: 'n8n',
      raw: body,
      createdAt: serverTimestamp(),
    };
    if (!docData.name || !docData.date) {
      return NextResponse.json({ error: 'name and date are required' }, { status: 400 });
    }
    const ref = await addDoc(collection(db, 'bookings'), docData);
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


