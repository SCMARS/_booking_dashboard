import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-webhook-secret') || '';
    const expected = process.env.NEXT_PUBLIC_N8N_WEBHOOK_SECRET || process.env.N8N_WEBHOOK_SECRET || '';
    if (expected && secret !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const docData: any = {
      callId: body.callId || null,
      clientNumber: body.clientNumber || null,
      channel: (body.channel || 'Call').toString(),
      status: (body.status || 'intent_detected').toString(),
      timestamp: body.timestamp || new Date().toISOString(),
      dialog: Array.isArray(body.dialog) ? body.dialog : [],
      errors: Array.isArray(body.errors) ? body.errors : [],
      meta: body.meta || {},
      source: 'n8n',
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, 'logs'), docData);
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


