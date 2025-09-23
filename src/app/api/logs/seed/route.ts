import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST() {
  try {
    const samples = [
      {
        callId: 'demo-1',
        channel: 'Phone',
        clientNumber: '+38591111222',
        status: 'intent_detected',
        timestamp: new Date().toISOString(),
        dialog: [
          { role: 'user', message: 'How can I make a reservation?' },
          { role: 'agent', message: 'Sure, for what date and time?' },
        ],
        errors: [],
        meta: { locale: 'en' },
      },
      {
        callId: 'demo-2',
        channel: 'Website',
        clientNumber: null,
        status: 'intent_detected',
        timestamp: new Date().toISOString(),
        dialog: [
          { role: 'user', message: 'Table for three' },
          { role: 'agent', message: 'Confirmed for 19:00' },
        ],
        errors: [],
        meta: { locale: 'en' },
      },
      {
        callId: 'demo-3',
        channel: 'Call',
        clientNumber: '+38593333444',
        status: 'booking_confirmed',
        timestamp: new Date().toISOString(),
        dialog: [
          { role: 'user', message: 'I would like to book a table for five' },
          { role: 'agent', message: 'Booking confirmed' },
        ],
        errors: [],
        meta: { locale: 'en' },
      },
    ];

    const writes = samples.map((s) => addDoc(collection(db, 'logs'), { ...s, createdAt: serverTimestamp() }));
    const refs = await Promise.all(writes);
    return NextResponse.json({ created: refs.map((r) => r.id) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


