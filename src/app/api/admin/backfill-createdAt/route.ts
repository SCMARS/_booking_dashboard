import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const col = searchParams.get('collection');
    if (!col || !['logs', 'bookings'].includes(col)) {
      return NextResponse.json({ error: 'collection must be logs or bookings' }, { status: 400 });
    }

    const snap = await getDocs(collection(db, col));
    let updated = 0;
    for (const d of snap.docs) {
      const data: any = d.data();
      if (!data?.createdAt) {
        await updateDoc(doc(db, col, d.id), { createdAt: serverTimestamp() });
        updated += 1;
      }
    }
    return NextResponse.json({ ok: true, collection: col, scanned: snap.size, updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}


