# 🚀 Vapi Quick Setup

## 1. Get Keys from Vapi
1. Login to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Go to **API Keys**
3. Copy:
   - **Private API Key**
   - **Public API Key**
4. Go to **Assistants**
5. Copy **Assistant ID**

## 2. Create .env.local file
```bash
# Create file in project root
touch .env.local
```

Add to file:
```env
# Vapi Configuration
VAPI_PRIVATE_KEY=your-private-key
VAPI_PUBLIC_KEY=your-public-key
VAPI_ASSISTANT_ID=your-assistant-id

# Webhook URL (for local development)
VAPI_WEBHOOK_URL=http://localhost:3000/api/vapi/webhook
```

## 3. Restart Server
```bash
npm run dev
```

## 4. Test Functionality
1. Open http://localhost:3000
2. Click **Test Assistants API** - should show your assistants
3. Click **Test Call API** - should create test call
4. Vapi widget should load in bottom right corner

## 5. Setup Webhook (optional)
1. In Vapi Dashboard → **Webhooks**
2. Add URL: `https://your-domain.com/api/vapi/webhook`
3. Select events to track

## ❗ Important
- **DO NOT** commit `.env.local` file to git
- Use **your** keys, not examples from code
- For production add variables to Vercel settings

## 🔧 Troubleshooting
- **Widget not loading**: check `VAPI_PUBLIC_KEY`
- **API errors**: check `VAPI_PRIVATE_KEY`
- **Wrong assistant**: check `VAPI_ASSISTANT_ID`
- **Restart server** after changing .env.local
