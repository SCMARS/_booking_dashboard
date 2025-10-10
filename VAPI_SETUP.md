# Vapi AI Integration Setup

## Настройка Vapi для звонков

### 1. Получение API ключей

1. Войдите в ваш аккаунт Vapi
2. Перейдите в раздел "API Keys"
3. Скопируйте ваш **Private API Key** и **Public API Key**
4. Запишите ID вашего ассистента

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Vapi Configuration
VAPI_PRIVATE_KEY=455bbf66-6cd5-4f3e-ba7a-00c4977761d9
VAPI_PUBLIC_KEY=ea7c4170-a2cd-4b71-a37c-bf829fc2d0e6
VAPI_ASSISTANT_ID=c459fd1f-dcc7-4716-8dc8-e8c79ce5e319

# Webhook URL (для локальной разработки)
VAPI_WEBHOOK_URL=http://localhost:8001/api/vapi/webhook

# Для продакшена замените на ваш домен:
# VAPI_WEBHOOK_URL=https://your-domain.com/api/vapi/webhook
```

### 3. Настройка Webhook в Vapi

1. В панели Vapi перейдите в настройки webhook
2. Добавьте URL: `https://your-domain.com/api/vapi/webhook`
3. Выберите события для отслеживания:
   - call-started
   - call-ended
   - function-call
   - speech-update
   - transcript
   - message

### 4. API Endpoints

Проект включает следующие API endpoints:

#### `/api/vapi/call` (POST)
Создание исходящего звонка:
```json
{
  "phoneNumber": "+1234567890",
  "assistantId": "13b8bfd2-f6c0-4a78-9e85-d46744296327",
  "customer": {
    "number": "+1234567890"
  }
}
```

#### `/api/vapi/call` (GET)
Получение информации о звонке:
```
GET /api/vapi/call?callId=call-id-here
```

#### `/api/vapi/assistants` (GET)
Получение списка ассистентов

#### `/api/vapi/assistants` (POST)
Создание нового ассистента

#### `/api/vapi/webhook` (POST)
Webhook для обработки событий от Vapi

### 5. Использование

#### Виджет Vapi
Виджет автоматически загружается на главной странице и поддерживает:
- Голосовые звонки
- Многоязычность
- Настройки конфиденциальности

#### Кнопка звонка
Компонент `CallButton` позволяет инициировать звонки:
```tsx
<CallButton 
  phoneNumber="+1234567890" 
  assistantId="13b8bfd2-f6c0-4a78-9e85-d46744296327"
/>
```

### 6. Безопасность

- Private API Key используется только на сервере
- Public API Key используется в виджете
- Webhook проверяет подлинность событий

### 7. Тестирование

1. Убедитесь, что переменные окружения настроены
2. Перезапустите сервер: `npm run dev`
3. Откройте главную страницу
4. Используйте тестовый компонент для проверки API:
   - **Test Webhook** - проверяет доступность webhook endpoint
   - **Test Assistants API** - получает список ассистентов
   - **Test Call API** - тестирует создание звонка
5. Нажмите кнопку "Start AI Call" для тестирования звонков
6. Проверьте логи в консоли браузера и терминале сервера

### 8. Деплой

При деплое на Vercel:
1. Добавьте переменные окружения в настройках проекта
2. Обновите VAPI_WEBHOOK_URL на ваш домен
3. Обновите webhook URL в панели Vapi

### 9. Поддерживаемые языки

Виджет поддерживает 4 языка:
- 🇺🇸 English
- 🇷🇺 Русский  
- 🇭🇷 Hrvatski
- 🇪🇸 Español

Текст виджета автоматически адаптируется под выбранный язык.
