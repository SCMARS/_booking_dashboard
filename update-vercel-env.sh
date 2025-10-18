#!/bin/bash

echo "🔄 Обновление переменных окружения Vercel"
echo "========================================="

# Удаляем старые переменные
echo "🗑️ Удаляем старые переменные..."
vercel env rm NEXT_PUBLIC_VAPI_PUBLIC_KEY production --yes
vercel env rm VAPI_ASSISTANT_ID production --yes

# Добавляем новые переменные без лишних символов
echo "➕ Добавляем новые переменные..."

# Публичный ключ Vapi
printf "ea7c4170-a2cd-4b71-a37c-bf829fc2d0e6" | vercel env add NEXT_PUBLIC_VAPI_PUBLIC_KEY production

# Assistant ID
printf "27de6a8e-38ef-48ed-a1b6-8722da504802" | vercel env add VAPI_ASSISTANT_ID production

echo ""
echo "✅ Переменные обновлены!"
echo "🔄 Передеплоим проект..."

# Передеплоим проект
vercel --prod

echo ""
echo "🌐 Сайт будет доступен по адресу:"
echo "https://bmp-beryl.vercel.app/"
