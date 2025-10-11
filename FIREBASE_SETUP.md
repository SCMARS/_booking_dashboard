# 🔥 Firebase Setup Guide

## Problem: Firebase Authentication Error

**Error:** `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

**Cause:** Using placeholder values instead of real Firebase keys in `.env.local`

## Solution:

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new one)
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click **Web app** icon (`</>`)
6. Copy the configuration object

### 2. Update .env.local

Replace placeholder values in `.env.local`:

```env
# Firebase Configuration (REPLACE WITH REAL VALUES)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your-real-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Enable Authentication

1. In Firebase Console → **Authentication**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** provider
4. Save changes

### 4. Restart Server

```bash
npm run dev
```

### 5. Test Login

1. Go to `/register` to create account
2. Go to `/login` to sign in
3. Should work without errors

## Example Firebase Config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "myproject.firebaseapp.com",
  projectId: "myproject-12345",
  storageBucket: "myproject.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

## ⚠️ Important:
- Use **real** Firebase keys, not placeholders
- Restart server after changing `.env.local`
- Enable Email/Password authentication in Firebase Console
- Don't commit `.env.local` to git

## 🔧 Quick Fix:

1. Copy your real Firebase config
2. Update `.env.local` with real values
3. Restart server: `npm run dev`
4. Test login/register
