# 🔧 Environment Variables Setup

## Problem: API returns 500 error

This means Vapi environment variables are not configured.

## Solution:

### 1. Create/update `.env.local` file

In the project root, create `.env.local` file with content:

```env
# Vapi Configuration
VAPI_PRIVATE_KEY=your-private-key-here
VAPI_PUBLIC_KEY=your-public-key-here
VAPI_ASSISTANT_ID=your-assistant-id-here

# Firebase (if needed)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 2. Where to get Vapi keys:

1. Open [Vapi Dashboard](https://dashboard.vapi.ai)
2. Go to **API Keys**
3. Copy:
   - **Private API Key** → `VAPI_PRIVATE_KEY`
   - **Public API Key** → `VAPI_PUBLIC_KEY`
4. Go to **Assistants**
5. Copy **Assistant ID** → `VAPI_ASSISTANT_ID`

### 3. Restart server

```bash
npm run dev
```

### 4. Test functionality

Open in browser: `http://localhost:3000/api/vapi/config`

Should return:
```json
{
  "success": true,
  "config": {
    "publicKey": "your-public-key",
    "assistantId": "your-assistant-id"
  }
}
```

### 5. If still not working

1. Make sure file is named exactly `.env.local` (with dot at beginning)
2. Make sure file is in project root (next to package.json)
3. Restart server after changing file
4. Check server console for errors

## ⚠️ Important:
- DO NOT commit `.env.local` file to git
- Use your real keys, not examples
- Restart server after every .env.local change
