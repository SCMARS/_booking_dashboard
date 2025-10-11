# Vapi Webhook Setup Guide

## Настройка Webhook в Vapi Dashboard

Для получения реальных данных звонков в ваш дашборд, нужно настроить webhook в Vapi Dashboard.

### Шаги настройки:

1. **Зайдите в Vapi Dashboard**
   - Перейдите на https://dashboard.vapi.ai
   - Войдите в свой аккаунт

2. **Найдите настройки Webhook**
   - Ищите раздел "Webhooks", "Integrations" или "Settings"
   - Возможно в разделе "API" или "Developer Settings"

3. **Добавьте новый Webhook**
   - **Webhook URL**: `https://your-domain.vercel.app/api/vapi/webhook`
   - **События**: Выберите следующие события:
     - `call-started` - начало звонка
     - `call-ended` - окончание звонка
     - `transcript` - транскрипт разговора
     - `message` - сообщения в разговоре
     - `end-of-call-report` - отчет о звонке

4. **Сохраните настройки**

### Альтернативный способ через API:

Если в Dashboard нет настроек webhook, можно создать через API:

```bash
curl -X POST "https://api.vapi.ai/webhook-endpoint" \
  -H "Authorization: Bearer YOUR_PRIVATE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.vercel.app/api/vapi/webhook",
    "events": ["call-started", "call-ended", "transcript", "message", "end-of-call-report"]
  }'
```

### Проверка работы:

1. **Сделайте тестовый звонок** через Vapi виджет
2. **Проверьте логи** в вашем дашборде
3. **Убедитесь**, что данные сохраняются в Firebase

### Структура данных:

Webhook получает события в следующем формате:

```json
{
  "type": "call-ended",
  "call": {
    "id": "call-id",
    "phoneNumber": "+1234567890",
    "assistantId": "assistant-id",
    "status": "ended",
    "duration": 120,
    "endedReason": "completed",
    "transcript": "Полный транскрипт разговора",
    "summary": "Краткое резюме звонка",
    "analysis": {
      "summary": "Анализ звонка",
      "successEvaluation": "true/false"
    }
  }
}
```

### Troubleshooting:

- **Webhook не получает данные**: Проверьте URL и доступность вашего сервера
- **Данные не сохраняются**: Проверьте логи сервера и настройки Firebase
- **Ошибки Firebase**: Убедитесь, что индексы созданы правильно

### Полезные ссылки:

- [Vapi Documentation](https://docs.vapi.ai/)
- [Webhook Events](https://docs.vapi.ai/webhooks)
- [Firebase Console](https://console.firebase.google.com/project/booking-2c3e1)
