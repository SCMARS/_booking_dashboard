import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST() {
  try {
    const samples = [
      { name: 'Vanessa C.', date: new Date().toISOString().slice(0, 10), status: 'Confirmed', channel: 'WhatsApp' },
      { name: 'Mark T.', date: new Date().toISOString().slice(0, 10), status: 'Pending', channel: 'Website' },
      { name: 'Anna H.', date: new Date().toISOString().slice(0, 10), status: 'Confirmed', channel: 'Website' },
      { name: 'John D.', date: new Date().toISOString().slice(0, 10), status: 'Confirmed', channel: 'Call' },
    ];

    const writes = samples.map((s) => addDoc(collection(db, 'bookings'), { ...s, createdAt: serverTimestamp() }));
    const refs = await Promise.all(writes);
    return NextResponse.json({ created: refs.map((r) => r.id) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


