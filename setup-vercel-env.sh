#!/bin/bash

echo "🚀 Настройка переменных окружения для Vercel"
echo "============================================="

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен. Устанавливаем..."
    npm install -g vercel
fi

echo "📋 Настраиваем переменные окружения для проекта..."

# Firebase переменные
echo "🔥 Настройка Firebase переменных..."
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< "AIzaSyAEv2_HfE0VauvaPecZ3N9aAmwEAzRnrw4"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production <<< "booking-2c3e1.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production <<< "booking-2c3e1"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production <<< "booking-2c3e1.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production <<< "373888935111"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production <<< "1:373888935111:web:7c4b350d812323c75bcae2"
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production <<< "G-ZBFVMZ9VW6"

# Vapi переменные
echo "🎤 Настройка Vapi переменных..."
vercel env add VAPI_PRIVATE_KEY production <<< "455bbf66-6cd5-4f3e-ba7a-00c4977761d9"
vercel env add NEXT_PUBLIC_VAPI_PUBLIC_KEY production <<< "ea7c4170-a2cd-4b71-a37c-bf829fc2d0e6"
vercel env add VAPI_ASSISTANT_ID production <<< "27de6a8e-38ef-48ed-a1b6-8722da504802"

# Webhook URL
echo "🔗 Настройка Webhook URL..."
vercel env add VAPI_WEBHOOK_URL production <<< "https://bmp-beryl.vercel.app/api/vapi/webhook"

echo ""
echo "✅ Все переменные окружения настроены!"
echo ""
echo "🔄 Теперь нужно передеплоить проект:"
echo "vercel --prod"
echo ""
echo "📋 Проверить переменные можно командой:"
echo "vercel env ls"
echo ""
echo "🌐 После деплоя сайт будет доступен по адресу:"
echo "https://bmp-beryl.vercel.app/"
