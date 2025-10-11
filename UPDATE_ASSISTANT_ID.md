# 🔧 Update Assistant ID

## Problem
Wrong Assistant ID is used in `.env.local` file.

**Current ID in .env.local:** `13b8bfd2-f6c0-4a78-9e85-d46744296327`  
**Correct ID from Vapi Dashboard:** `27de6a8e-38ef-48ed-a1b6-8722da504802`

## Solution

### 1. Update `.env.local` file

Replace line:
```env
VAPI_ASSISTANT_ID=13b8bfd2-f6c0-4a78-9e85-d46744296327
```

With:
```env
VAPI_ASSISTANT_ID=27de6a8e-38ef-48ed-a1b6-8722da504802
```

### 2. Restart server

```bash
npm run dev
```

### 3. Test functionality

1. Open main page
2. Click "📞 Start AI Call" button
3. Now should use your "bmp_agent" assistant with correct prompt

### 4. Check API endpoint

Open: `http://localhost:3000/api/vapi/config`

Should return:
```json
{
  "success": true,
  "config": {
    "publicKey": "your-public-key",
    "assistantId": "27de6a8e-38ef-48ed-a1b6-8722da504802"
  }
}
```

## ✅ After update

- Vapi widget will use your "bmp_agent" assistant
- Prompt will be correct (Restaurant Reservation Assistant)
- First message: "Thank you for calling BMP Restaurant. This is Riley, your reservation assistant. How may I help you today?"

## 🔍 How to verify

1. In Vapi Dashboard → Assistants → bmp_agent
2. Copy ID: `27de6a8e-38ef-48ed-a1b6-8722da504802`
3. Update `.env.local`
4. Restart server
