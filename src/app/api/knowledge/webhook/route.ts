import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
export async function POST(req: Request) {
  try {
    const key = req.headers.get('x-api-key');
    if (process.env.N8N_INBOUND_KEY && key !== process.env.N8N_INBOUND_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const action = body?.action;
    const items: any[] = Array.isArray(body?.items) ? body.items : [];
    if (!action || !items.length) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    if (action === 'delete') {
      for (const it of items) {
        if (it?.id) await deleteDoc(doc(db, 'knowledge_faq', String(it.id)));
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'upsert') {
      for (const it of items) {
        const payload: any = {
          question: String(it.question || ''),
          answer: String(it.answer || ''),
          category: String(it.category || 'General'),
          updatedAt: serverTimestamp(),
        };
        if (it?.id) {
          await setDoc(doc(db, 'knowledge_faq', String(it.id)), payload, { merge: true });
        } else {
          const ref = doc(collection(db, 'knowledge_faq'));
          await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
        }
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


