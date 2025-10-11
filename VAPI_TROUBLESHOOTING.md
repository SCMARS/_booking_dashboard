# 🔧 Vapi Troubleshooting

## Problem: "Start AI Call" button disappeared

### 1. Check environment variables

Make sure `.env.local` file exists and contains correct keys:

```env
VAPI_PRIVATE_KEY=your-private-key
VAPI_PUBLIC_KEY=your-public-key
VAPI_ASSISTANT_ID=your-assistant-id
```

### 2. Restart server

After changing `.env.local`, restart the server:

```bash
npm run dev
```

### 3. Check component states

On main page you should see:

- **"Start AI Call" button** - if configuration loaded successfully
- **"Loading Vapi config..."** - if configuration is loading
- **"⚠️ Vapi Configuration Error"** - if there's configuration problem

### 4. Check browser console

Open Developer Tools (F12) and check Console tab for errors:

- `Failed to fetch Vapi config` - API endpoint problem
- `Vapi configuration is missing` - missing environment variables

### 5. Check API endpoint

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

### 6. Common errors

**"Vapi configuration is missing"**
- Check that `.env.local` file exists
- Make sure variables are named correctly
- Restart server

**"Network error"**
- Check that server is running on port 3000
- Make sure there are no network issues

**Widget not loading**
- Check `VAPI_PUBLIC_KEY`
- Make sure key is valid in Vapi Dashboard

### 7. Testing

Use test buttons on main page:
- **Test Webhook** - checks webhook availability
- **Test Assistants API** - checks Vapi connection
- **Test Call API** - tests call creation

### 8. If nothing helps

1. Delete `.env.local` file
2. Create new one with correct keys
3. Restart server
4. Clear browser cache (Ctrl+Shift+R)