import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

const COLLECTION = 'knowledge_faq';

export async function GET() {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = {
      question: typeof body.question === 'string' ? body.question : '',
      answer: typeof body.answer === 'string' ? body.answer : '',
      category: typeof body.category === 'string' ? body.category : 'General',
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, COLLECTION), item);
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


