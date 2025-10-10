import { NextRequest, NextResponse } from 'next/server';

// Vapi Private API Key
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!VAPI_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPI_PRIVATE_KEY is not configured' },
        { status: 500 }
      );
    }

    // Получение списка ассистентов
    const assistantsResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!assistantsResponse.ok) {
      const errorData = await assistantsResponse.json();
      console.error('Vapi API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch assistants', details: errorData },
        { status: assistantsResponse.status }
      );
    }

    const assistantsData = await assistantsResponse.json();
    
    return NextResponse.json({
      success: true,
      assistants: assistantsData
    });

  } catch (error) {
    console.error('Fetch assistants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Создание нового ассистента
    const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!assistantResponse.ok) {
      const errorData = await assistantResponse.json();
      console.error('Vapi API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create assistant', details: errorData },
        { status: assistantResponse.status }
      );
    }

    const assistantData = await assistantResponse.json();
    
    return NextResponse.json({
      success: true,
      assistant: assistantData
    });

  } catch (error) {
    console.error('Create assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
