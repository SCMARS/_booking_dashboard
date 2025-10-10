import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/app/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.body;


    await addDoc(collection(db, 'logs'), {
      timestamp: new Date(),
      channel: 'Call',
      text: body.text,
      intent: body.intent,
      status: body.status,
    });


    if (body.intent === 'booking') {
      await addDoc(collection(db, 'bookings'), {
        name: body.guestName || 'Unknown',
        date: body.date,
        status: 'Pending',
        channel: 'Call',
      });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Webhook error' });
  }
}
