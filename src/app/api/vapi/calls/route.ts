import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Vapi Private API Key
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;

// Получение звонков из Vapi API
async function getVapiCalls(limitCount: number = 10) {
  if (!VAPI_PRIVATE_KEY) {
    throw new Error('VAPI_PRIVATE_KEY is not configured');
  }

  const response = await fetch(`https://api.vapi.ai/call?limit=${limitCount}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Vapi API error: ${errorData.message || 'Unknown error'}`);
  }

  return await response.json();
}

// Сохранение звонков в Firebase
async function saveCallsToFirebase(calls: any[]) {
  const savedCalls = [];
  
  for (const call of calls) {
    try {
      // Проверяем, есть ли уже такой звонок в базе
      const existingCallQuery = query(
        collection(db, 'logs'),
        where('callId', '==', call.id),
        where('type', '==', 'call_summary')
      );
      const existingCalls = await getDocs(existingCallQuery);
      
      if (existingCalls.empty) {
        // Создаем новый документ
        const callData: any = {
          callId: call.id,
          channel: 'Call',
          status: call.status,
          createdAt: new Date(call.createdAt),
          updatedAt: new Date(call.updatedAt),
          type: 'call_summary'
        };
        
        // Добавляем поля только если они не undefined
        if (call.phoneNumber) callData.phoneNumber = call.phoneNumber;
        if (call.assistantId) callData.assistantId = call.assistantId;
        if (call.duration) callData.duration = call.duration;
        if (call.endedReason) callData.endedReason = call.endedReason;
        if (call.transcript) callData.transcript = call.transcript;
        if (call.summary) callData.summary = call.summary;
        if (call.analysis) callData.analysis = call.analysis;
        
        const docRef = await addDoc(collection(db, 'logs'), callData);
        savedCalls.push({ id: docRef.id, ...callData });
        console.log(`✅ Saved call ${call.id} to Firebase`);
      } else {
        console.log(`⏭️ Call ${call.id} already exists in Firebase`);
      }
    } catch (error) {
      console.error(`❌ Failed to save call ${call.id}:`, error);
    }
  }
  
  return savedCalls;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sync = searchParams.get('sync');
    const limitCount = parseInt(searchParams.get('limit') || '10');

    if (sync === 'true') {
      // Синхронизация звонков из Vapi в Firebase
      console.log('🔄 Syncing calls from Vapi to Firebase...');
      
      const vapiCalls = await getVapiCalls(limitCount);
      const savedCalls = await saveCallsToFirebase(vapiCalls);
      
      return NextResponse.json({
        success: true,
        message: `Synced ${savedCalls.length} calls from Vapi`,
        calls: savedCalls
      });
    } else {
      // Получение звонков напрямую из Vapi
      const calls = await getVapiCalls(limitCount);
      
      return NextResponse.json({
        success: true,
        calls: calls
      });
    }

  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch calls',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callId } = body;

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      );
    }

    if (!VAPI_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPI_PRIVATE_KEY is not configured' },
        { status: 500 }
      );
    }

    // Получение конкретного звонка из Vapi
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to get call from Vapi', details: errorData },
        { status: response.status }
      );
    }

    const callData = await response.json();
    
    // Сохраняем в Firebase
    try {
      const callDoc: any = {
        callId: callData.id,
        channel: 'Call',
        status: callData.status,
        createdAt: new Date(callData.createdAt),
        updatedAt: new Date(callData.updatedAt),
        type: 'call_summary'
      };
      
      // Добавляем поля только если они не undefined
      if (callData.phoneNumber) callDoc.phoneNumber = callData.phoneNumber;
      if (callData.assistantId) callDoc.assistantId = callData.assistantId;
      if (callData.duration) callDoc.duration = callData.duration;
      if (callData.endedReason) callDoc.endedReason = callData.endedReason;
      if (callData.transcript) callDoc.transcript = callData.transcript;
      if (callData.summary) callDoc.summary = callData.summary;
      if (callData.analysis) callDoc.analysis = callData.analysis;
      
      const docRef = await addDoc(collection(db, 'logs'), callDoc);
      
      return NextResponse.json({
        success: true,
        call: { id: docRef.id, ...callDoc }
      });
    } catch (firebaseError) {
      console.error('Failed to save to Firebase:', firebaseError);
      return NextResponse.json(
        { error: 'Failed to save call to Firebase' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching specific call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
