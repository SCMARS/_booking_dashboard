import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔔 Vapi webhook received:', JSON.stringify(body, null, 2));


    switch (body.type) {
      case 'call-started':
        console.log('📞 Call started:', {
          callId: body.call?.id,
          phoneNumber: body.call?.phoneNumber,
          assistantId: body.call?.assistantId,
          status: body.call?.status
        });
        

        try {
          const logData: any = {
            callId: body.call?.id,
            channel: 'Call',
            status: 'call_started',
            createdAt: new Date(),
            type: 'call_event'
          };
          
          // Добавляем поля только если они не undefined
          if (body.call?.phoneNumber) logData.phoneNumber = body.call.phoneNumber;
          if (body.call?.assistantId) logData.assistantId = body.call.assistantId;
          
          await addDoc(collection(db, 'logs'), logData);
          console.log('✅ Call start logged to Firebase');
        } catch (error) {
          console.error('❌ Failed to log call start:', error);
        }
        break;
        
      case 'call-ended':
        console.log('📞 Call ended:', {
          callId: body.call?.id,
          duration: body.call?.endedReason,
          status: body.call?.status,
          transcript: body.call?.transcript
        });
        

        try {
          const logsQuery = query(collection(db, 'logs'), where('callId', '==', body.call?.id));
          const logsSnapshot = await getDocs(logsQuery);
          
          if (logsSnapshot.empty) {
            const logData: any = {
              callId: body.call?.id,
              channel: 'Call',
              status: 'call_ended',
              createdAt: new Date(),
              type: 'call_event'
            };
            
            // Добавляем поля только если они не undefined
            if (body.call?.phoneNumber) logData.phoneNumber = body.call.phoneNumber;
            if (body.call?.assistantId) logData.assistantId = body.call.assistantId;
            if (body.call?.duration) logData.duration = body.call.duration;
            if (body.call?.endedReason) logData.endedReason = body.call.endedReason;
            if (body.call?.transcript) logData.transcript = body.call.transcript;
            if (body.call?.summary) logData.summary = body.call.summary;
            if (body.call?.analysis) logData.analysis = body.call.analysis;

            await addDoc(collection(db, 'logs'), logData);
          } else {
            // Обновляем существующий лог
            const logDoc = logsSnapshot.docs[0];
            const updateData: any = {
              status: 'call_ended',
              updatedAt: new Date()
            };
            
            // Добавляем поля только если они не undefined
            if (body.call?.duration) updateData.duration = body.call.duration;
            if (body.call?.endedReason) updateData.endedReason = body.call.endedReason;
            if (body.call?.transcript) updateData.transcript = body.call.transcript;
            if (body.call?.summary) updateData.summary = body.call.summary;
            if (body.call?.analysis) updateData.analysis = body.call.analysis;
            
            await updateDoc(doc(db, 'logs', logDoc.id), updateData);
          }
          
          console.log('✅ Call end logged to Firebase');
        } catch (error) {
          console.error('❌ Failed to log call end:', error);
        }
        break;
        
      case 'function-call':
        console.log('⚙️ Function call:', {
          callId: body.callId,
          functionName: body.functionCall?.functionName,
          parameters: body.functionCall?.parameters
        });
        break;
        
      case 'speech-update':
        console.log('🗣️ Speech update:', {
          callId: body.callId,
          message: body.speechUpdate?.message,
          role: body.speechUpdate?.role
        });
        break;
        
      case 'transcript':
        console.log('📝 Transcript:', {
          callId: body.callId,
          message: body.transcript?.message,
          role: body.transcript?.role
        });
        
        // Сохраняем транскрипт в logs
        try {
          const logData: any = {
            callId: body.callId,
            channel: 'Call',
            status: 'transcript',
            createdAt: new Date(),
            type: 'transcript'
          };
          
          if (body.transcript?.message) logData.message = body.transcript.message;
          if (body.transcript?.role) logData.role = body.transcript.role;
          
          await addDoc(collection(db, 'logs'), logData);
        } catch (error) {
          console.error('❌ Failed to log transcript:', error);
        }
        break;
        
      case 'message':
        console.log(' Message:', {
          callId: body.callId,
          message: body.message?.message,
          role: body.message?.role
        });
        

        try {
          const logData: any = {
            callId: body.callId,
            channel: 'Call',
            status: 'message',
            createdAt: new Date(),
            type: 'message'
          };
          
          if (body.message?.message) logData.message = body.message.message;
          if (body.message?.role) logData.role = body.message.role;
          
          await addDoc(collection(db, 'logs'), logData);
        } catch (error) {
          console.error('❌ Failed to log message:', error);
        }
        break;
        
      default:
        console.log('❓ Unknown event type:', body.type, body);
    }

    // Логирование для отладки
    console.log(`✅ Processed webhook event: ${body.type}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Processed ${body.type} event`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
