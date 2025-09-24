import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type Body = {
  name?: string;
  date?: string; 
  status?: 'Confirmed' | 'Pending' | 'cancelled';
  channel?: string;
  phone?: string;
  time?: string;
  partySize?: number;
  notes?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const name = (body.name || '').trim();
    const date = (body.date || '').trim();
    const status = (body.status || 'Pending');
    const channel = (body.channel || 'Website');
    const phone = (body.phone || '').trim();
    const time = (body.time || '').trim();
    const partySize = typeof body.partySize === 'number' ? body.partySize : undefined;
    const notes = (body.notes || '').trim();

    if (!name || !date) {
      return NextResponse.json({ error: 'name and date are required' }, { status: 400 });
    }

    const doc = {
      name,
      date,
      status,
      channel,
      ...(phone ? { phone } : {}),
      ...(time ? { time } : {}),
      ...(partySize ? { partySize } : {}),
      ...(notes ? { notes } : {}),
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, 'bookings'), doc);
    return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


