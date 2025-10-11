#!/bin/bash

echo "Обновление Vapi ключей в .env.local"
echo "=================================="

# Читаем текущий .env.local
cp .env.local .env.local.backup

# Запрашиваем у пользователя реальные ключи
echo "Введите ваши реальные Vapi ключи:"
echo ""

read -p "VAPI_PRIVATE_KEY: " VAPI_PRIVATE_KEY
read -p "VAPI_PUBLIC_KEY: " VAPI_PUBLIC_KEY  
read -p "VAPI_ASSISTANT_ID: " VAPI_ASSISTANT_ID

# Обновляем файл
sed -i '' "s/VAPI_PRIVATE_KEY=.*/VAPI_PRIVATE_KEY=$VAPI_PRIVATE_KEY/" .env.local
sed -i '' "s/VAPI_PUBLIC_KEY=.*/VAPI_PUBLIC_KEY=$VAPI_PUBLIC_KEY/" .env.local
sed -i '' "s/VAPI_ASSISTANT_ID=.*/VAPI_ASSISTANT_ID=$VAPI_ASSISTANT_ID/" .env.local

echo ""
echo "✅ Ключи обновлены в .env.local"
echo "Перезапустите сервер для применения изменений"
echo ""

# Показываем обновленный конфиг
echo "Проверяем обновленный конфиг:"
grep "VAPI_" .env.local
