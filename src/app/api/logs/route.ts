import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';

const API_KEY = process.env.LOGS_API_KEY;

function validateLog(input: any) {
  const errors: string[] = [];
  const out: any = {};
  if (input == null || typeof input !== 'object') errors.push('Body must be JSON object');
  out.callId = typeof input?.callId === 'string' ? input.callId : undefined;
  out.channel = typeof input?.channel === 'string' ? input.channel : undefined;
  out.clientNumber = typeof input?.clientNumber === 'string' ? input.clientNumber : null;
  out.status = typeof input?.status === 'string' ? input.status : undefined;
  if (Array.isArray(input?.dialog)) {
    out.dialog = input.dialog.filter((d: any) => d && typeof d.role === 'string' && typeof d.message === 'string');
  }
  out.ttsUrl = typeof input?.ttsUrl === 'string' ? input.ttsUrl : null;
  out.timestamp = typeof input?.timestamp === 'string' ? input.timestamp : undefined;
  out.errors = Array.isArray(input?.errors) ? input.errors.filter((e: any) => typeof e === 'string') : [];
  out.meta = (input?.meta && typeof input.meta === 'object') ? input.meta : {};
  out.bookingId = typeof input?.bookingId === 'string' ? input.bookingId : undefined;
  return { ok: errors.length === 0, errors, data: out };
}

export async function POST(req: Request) {
  try {

    const providedKey = req.headers.get('x-api-key');
    if (!API_KEY || providedKey !== API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idempotencyKey = req.headers.get('idempotency-key') || '';
    const body = await req.json();
    const parsed = validateLog(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: 'Invalid body', issues: parsed.errors }, { status: 400 });
    }


    if (idempotencyKey) {
      const q = query(
        collection(db, 'logs'),
        where('meta.idempotencyKey', '==', idempotencyKey),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return NextResponse.json({ id: snap.docs[0].id, idempotent: true }, { status: 200 });
      }
    }

    const data = parsed.data as any;
    const safe = {
      callId: data.callId || null,
      channel: data.channel || null,
      clientNumber: data.clientNumber || null,
      status: data.status || 'unknown',
      dialog: data.dialog || [],
      ttsUrl: data.ttsUrl || null,
      timestamp: data.timestamp || new Date().toISOString(),
      errors: data.errors || [],
      bookingId: data.bookingId || null,
      meta: { ...(data.meta || {}), idempotencyKey },
      createdAt: serverTimestamp(),
    } as const;

    const ref = await addDoc(collection(db, 'logs'), safe);
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}


