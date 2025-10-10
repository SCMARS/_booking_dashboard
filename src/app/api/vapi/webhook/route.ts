import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔔 Vapi webhook received:', JSON.stringify(body, null, 2));

    // Обработка различных типов событий от Vapi
    switch (body.type) {
      case 'call-started':
        console.log('📞 Call started:', {
          callId: body.call?.id,
          phoneNumber: body.call?.phoneNumber,
          assistantId: body.call?.assistantId,
          status: body.call?.status
        });
        
        // Можно добавить уведомления в реальном времени
        // Например, через WebSocket или Server-Sent Events
        break;
        
      case 'call-ended':
        console.log('📞 Call ended:', {
          callId: body.call?.id,
          duration: body.call?.endedReason,
          status: body.call?.status,
          transcript: body.call?.transcript
        });
        
        // Здесь можно сохранить результаты звонка в базу данных
        // или отправить уведомления администраторам
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
        break;
        
      case 'message':
        console.log('💬 Message:', {
          callId: body.callId,
          message: body.message?.message,
          role: body.message?.role
        });
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
  // Простая проверка доступности webhook
  return NextResponse.json({ 
    status: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
