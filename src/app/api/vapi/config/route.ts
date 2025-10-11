import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || process.env.VAPI_PUBLIC_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    console.log('🔍 Vapi Config Check:');
    console.log('- NEXT_PUBLIC_VAPI_PUBLIC_KEY:', publicKey ? '✅ Set' : '❌ Missing');
    console.log('- VAPI_ASSISTANT_ID:', assistantId ? '✅ Set' : '❌ Missing');

    if (!publicKey || !assistantId) {
      const missingVars = [];
      if (!publicKey) missingVars.push('NEXT_PUBLIC_VAPI_PUBLIC_KEY');
      if (!assistantId) missingVars.push('VAPI_ASSISTANT_ID');
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing environment variables: ${missingVars.join(', ')}. Please check your .env.local file.` 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config: {
        publicKey,
        assistantId
      }
    });

  } catch (error) {
    console.error('Config fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
