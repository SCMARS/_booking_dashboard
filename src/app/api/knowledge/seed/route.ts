import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST() {
  try {
    const items = [
      { question: 'How to book a table?', answer: 'Call us or book online. We confirm in 5 minutes.', category: 'Booking' },
      { question: 'Do you have vegan options?', answer: 'Yes, several dishes are vegan-friendly.', category: 'Menu' },
      { question: 'Do you deliver?', answer: 'Delivery is available via our partners.', category: 'Delivery' },
    ];
    const writes = items.map((i) => addDoc(collection(db, 'knowledge_faq'), { ...i, createdAt: serverTimestamp() }));
    const refs = await Promise.all(writes);
    return NextResponse.json({ created: refs.map((r) => r.id) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


