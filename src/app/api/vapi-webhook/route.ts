import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin only at runtime when env vars are present.
// Avoid throwing during build to allow Next.js to collect page data.
let db: admin.firestore.Firestore | null = null;
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
    db = admin.firestore();
  } else {
    // Defer initialization error to request time to prevent build failures.
    db = null;
  }
} else {
  db = admin.firestore();
}

type VapiPayload = {
  event?: string;
  data?: Record<string, any>;
};

const jsonError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return jsonError('Server misconfiguration: Firebase not initialized', 500);
    }
    const expectedSecret = process.env.VAPI_SECRET;
    if (expectedSecret) {
      const provided = req.headers.get('x-vapi-secret');
      if (!provided || provided !== expectedSecret) {
        return jsonError('Unauthorized', 401);
      }
    }

    let body: VapiPayload;
    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON payload');
    }

    if (!body || typeof body !== 'object') {
      return jsonError('Payload must be a JSON object');
    }

    const { event, data } = body;

    if (!event || typeof event !== 'string') {
      return jsonError('Missing or invalid event type');
    }

    if (!data || typeof data !== 'object') {
      return jsonError('Missing or invalid data object');
    }

    console.log('Received Vapi webhook:', { event, data });

    switch (event) {
      case 'call.ended': {
        const callId: string | undefined = data.call_id || data.id;
        if (!callId) {
          return jsonError('Missing call_id for call.ended event');
        }

        await db.collection('calls').doc(callId).set(
          {
            status: 'ended',
            duration: data.duration ?? null,
            started_at: data.started_at ?? null,
            ended_at: data.ended_at ?? null,
            summary: data.summary ?? null,
            raw: data,
            received_at: admin.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
        break;
      }

      case 'booking.created': {
        await db.collection('bookings').add({
          customer_name: data.customer_name ?? 'Unknown guest',
          date: data.date ?? null,
          time: data.time ?? null,
          party_size: data.party_size ?? null,
          channel: data.channel ?? 'Call',
          raw: data,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        break;
      }

      default:
        console.log('Unhandled Vapi event type:', event);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return jsonError('Webhook internal error', 500);
  }
}

export async function GET() {
  return jsonError('Method not allowed', 405);
}
