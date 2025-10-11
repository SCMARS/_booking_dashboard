#!/bin/bash

echo "🔧 Обновление Assistant ID в .env.local..."

# Создаем резервную копию
cp .env.local .env.local.backup

# Обновляем Assistant ID
sed -i '' 's/VAPI_ASSISTANT_ID=.*/VAPI_ASSISTANT_ID=27de6a8e-38ef-48ed-a1b6-8722da504802/' .env.local

echo "✅ Assistant ID обновлен!"
echo "📋 Новый ID: 27de6a8e-38ef-48ed-a1b6-8722da504802"
echo "🔄 Перезапустите сервер: npm run dev"
echo "📁 Резервная копия сохранена в .env.local.backup"
