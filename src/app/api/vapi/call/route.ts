import { NextRequest, NextResponse } from 'next/server';

// Vapi Private API Key
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!VAPI_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPI_PRIVATE_KEY is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { phoneNumber, assistantId, customer, phoneNumberId } = body;

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      );
    }

    // Для тестирования используем входящий звонок вместо исходящего
    // так как исходящие звонки требуют настройки phoneNumberId в Vapi
    const callData: any = {
      assistantId: assistantId,
      type: 'inboundPhoneCall', // Изменено на входящий звонок для тестирования
    };

    // Если есть phoneNumberId, используем исходящий звонок
    if (phoneNumberId) {
      callData.type = 'outboundPhoneCall';
      callData.phoneNumberId = phoneNumberId;
      callData.customer = customer || {
        number: phoneNumber,
      };
    }

    console.log('Creating call with data:', callData);

    // Создание звонка через Vapi API
    const callResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callData),
    });

    if (!callResponse.ok) {
      const errorData = await callResponse.json();
      console.error('Vapi API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create call', details: errorData },
        { status: callResponse.status }
      );
    }

    const responseData = await callResponse.json();
    
    return NextResponse.json({
      success: true,
      callId: responseData.id,
      status: responseData.status,
      message: 'Call initiated successfully'
    });

  } catch (error) {
    console.error('Call creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      );
    }

    // Получение информации о звонке
    const callResponse = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!callResponse.ok) {
      const errorData = await callResponse.json();
      return NextResponse.json(
        { error: 'Failed to get call info', details: errorData },
        { status: callResponse.status }
      );
    }

    const callData = await callResponse.json();
    
    return NextResponse.json({
      success: true,
      call: callData
    });

  } catch (error) {
    console.error('Get call error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
