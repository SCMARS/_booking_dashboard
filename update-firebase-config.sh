#!/bin/bash

echo "🔥 Updating Firebase Configuration"
echo "=================================="

# Backup current config
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

# Update Firebase config with real values
cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAEv2_HfE0VauvaPecZ3N9aAmwEAzRnrw4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=booking-2c3e1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=booking-2c3e1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=booking-2c3e1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=373888935111
NEXT_PUBLIC_FIREBASE_APP_ID=1:373888935111:web:7c4b350d812323c75bcae2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZBFVMZ9VW6

# Vapi Configuration
VAPI_PRIVATE_KEY=your-private-key-here
VAPI_PUBLIC_KEY=your-public-key-here
VAPI_ASSISTANT_ID=your-assistant-id-here

# Webhook URL
VAPI_WEBHOOK_URL=http://localhost:3000/api/vapi/webhook
EOF

echo "✅ Firebase configuration updated!"
echo "📋 Updated values:"
echo "- API Key: AIzaSyAEv2_HfE0VauvaPecZ3N9aAmwEAzRnrw4"
echo "- Project ID: booking-2c3e1"
echo "- Auth Domain: booking-2c3e1.firebaseapp.com"
echo ""
echo "🔄 Now restart the server:"
echo "npm run dev"
echo ""
echo "📁 Backup saved as .env.local.backup.*"
