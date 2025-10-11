# Vapi AI Integration Setup

## Vapi Setup for Calls

### 1. Get API Keys

1. Login to your Vapi account
2. Go to "API Keys" section
3. Copy your **Private API Key** and **Public API Key**
4. Note your assistant ID

### 2. Environment Variables Setup

Create `.env.local` file in project root:

```env
# Vapi Configuration
VAPI_PRIVATE_KEY=your-private-key-here
VAPI_PUBLIC_KEY=your-public-key-here
VAPI_ASSISTANT_ID=your-assistant-id-here

# Webhook URL (for local development)
VAPI_WEBHOOK_URL=http://localhost:3000/api/vapi/webhook

# For production replace with your domain:
# VAPI_WEBHOOK_URL=https://your-domain.com/api/vapi/webhook
```

**Important:** 
- `VAPI_PRIVATE_KEY` - used only on server for API calls
- `VAPI_PUBLIC_KEY` - used in client code (widget)
- `VAPI_ASSISTANT_ID` - your assistant ID from Vapi panel

### 3. Webhook Setup in Vapi

1. In Vapi panel go to webhook settings
2. Add URL: `https://your-domain.com/api/vapi/webhook`
3. Select events to track:
   - call-started
   - call-ended
   - function-call
   - speech-update
   - transcript
   - message

### 4. API Endpoints

Project includes following API endpoints:

#### `/api/vapi/call` (POST)
Create outbound call:
```json
{
  "phoneNumber": "+1234567890",
  "assistantId": "13b8bfd2-f6c0-4a78-9e85-d46744296327",
  "customer": {
    "number": "+1234567890"
  }
}
```

#### `/api/vapi/call` (GET)
Get call information:
```
GET /api/vapi/call?callId=call-id-here
```

#### `/api/vapi/assistants` (GET)
Get assistants list

#### `/api/vapi/assistants` (POST)
Create new assistant

#### `/api/vapi/webhook` (POST)
Webhook for processing Vapi events

### 5. Usage

#### Vapi Widget
Widget automatically loads on main page and supports:
- Voice calls
- Multilingual support
- Privacy settings

#### Call Button
`CallButton` component allows initiating calls:
```tsx
<CallButton 
  phoneNumber="+1234567890" 
  assistantId="13b8bfd2-f6c0-4a78-9e85-d46744296327"
/>
```

### 6. Security

- Private API Key used only on server
- Public API Key used in widget
- Webhook verifies event authenticity

### 7. Testing

1. Make sure environment variables are configured in `.env.local`
2. Restart server: `npm run dev`
3. Open main page
4. Use test component to check API:
   - **Test Webhook** - checks webhook endpoint availability
   - **Test Assistants API** - gets assistants list
   - **Test Call API** - tests call creation (uses your assistant ID)
5. Click "Start AI Call" button to test calls
6. Check logs in browser console and server terminal

**Configuration check:**
- Vapi widget should load with your keys
- All API tests should pass successfully
- No missing keys errors in console

### 8. Deployment

When deploying to Vercel:
1. Add environment variables in project settings:
   - `VAPI_PRIVATE_KEY`
   - `VAPI_PUBLIC_KEY`
   - `VAPI_ASSISTANT_ID`
   - `VAPI_WEBHOOK_URL` (update to your domain)
2. Update webhook URL in Vapi panel to: `https://your-domain.com/api/vapi/webhook`
3. Restart deployment to apply environment variables

### 9. Supported Languages

Widget supports 4 languages:
- 🇺🇸 English
- 🇷🇺 Русский  
- 🇭🇷 Hrvatski
- 🇪🇸 Español

Widget text automatically adapts to selected language.