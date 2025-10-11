// Скрипт для настройки webhook через Vapi API
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
const WEBHOOK_URL = 'https://your-domain.com/api/vapi/webhook'; // Замените на ваш URL

async function setupWebhook() {
  try {
    const response = await fetch('https://api.vapi.ai/webhook-endpoint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        events: [
          'call-started',
          'call-ended', 
          'transcript',
          'message',
          'function-call'
        ]
      })
    });

    if (response.ok) {
      const webhook = await response.json();
      console.log('✅ Webhook created:', webhook);
    } else {
      const error = await response.json();
      console.error('❌ Failed to create webhook:', error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupWebhook();
