# GitHub Secrets Setup для CI/CD

Этот документ описывает, как настроить GitHub Secrets для автоматического деплоя с интеграцией Vapi.

## 🔐 Необходимые Secrets

### Vapi Configuration
Добавьте следующие secrets в настройках вашего GitHub репозитория:

1. **VAPI_PRIVATE_KEY**
   - Значение: `your-private-key-here`
   - Описание: Private API ключ для серверных запросов к Vapi

2. **VAPI_PUBLIC_KEY**
   - Значение: `your-public-key-here`
   - Описание: Public API ключ для клиентских запросов к Vapi

3. **VAPI_ASSISTANT_ID**
   - Значение: `your-assistant-id-here`
   - Описание: ID ассистента для звонков

4. **VAPI_WEBHOOK_URL**
   - Значение: `https://bmp-7m067s2f4-scmars-projects.vercel.app/api/vapi/webhook`
   - Описание: URL для webhook (замените на ваш домен после деплоя)

### Vercel Configuration
5. **VERCEL_TOKEN**
   - Получите в Vercel Dashboard → Settings → Tokens
   - Создайте новый токен с правами на деплой

6. **ORG_ID**
   - Получите в Vercel Dashboard → Settings → General
   - Скопируйте Organization ID

7. **PROJECT_ID**
   - Получите в Vercel Dashboard → Settings → General
   - Скопируйте Project ID

### Firebase Configuration (если используется)
8. **NEXT_PUBLIC_FIREBASE_API_KEY**
9. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
10. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
11. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
12. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
13. **NEXT_PUBLIC_FIREBASE_APP_ID**
14. **NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID**

## 📋 Как добавить Secrets

1. Перейдите в ваш GitHub репозиторий
2. Нажмите на вкладку **Settings**
3. В левом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**
5. Введите название secret (например, `VAPI_PRIVATE_KEY`)
6. Введите значение secret
7. Нажмите **Add secret**
8. Повторите для всех необходимых secrets

## 🚀 Процесс деплоя

После настройки secrets:

1. **Push в main ветку** автоматически запустит CI/CD пайплайн
2. **Тестирование** - проверка линтера, типов и сборки
3. **API тестирование** - проверка Vapi endpoints
4. **Деплой** - автоматический деплой на Vercel
5. **Уведомления** - статус деплоя в GitHub Actions

## 🔧 Локальная разработка

Для локальной разработки создайте файл `.env.local`:

```env
# Vapi Configuration
VAPI_PRIVATE_KEY=your-private-key-here
VAPI_PUBLIC_KEY=your-public-key-here
VAPI_ASSISTANT_ID=your-assistant-id-here
VAPI_WEBHOOK_URL=http://localhost:8001/api/vapi/webhook

# Firebase Configuration (если используется)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
```

## 🧪 Тестирование

После деплоя проверьте:

1. **Главная страница** - должна загружаться без ошибок
2. **Vapi виджет** - должен отображаться и работать
3. **API endpoints** - используйте тестовый компонент на главной странице
4. **Webhook** - проверьте логи в Vercel Functions

## 📞 Настройка Vapi Webhook

После деплоя:

1. Перейдите в Vapi Dashboard
2. Настройте webhook URL: `https://your-domain.vercel.app/api/vapi/webhook`
3. Выберите события для отправки:
   - `call-started`
   - `call-ended`
   - `transcript`
   - `speech-update`

## ⚠️ Важные замечания

- **Никогда не коммитьте** `.env.local` файл в репозиторий
- **Обновите VAPI_WEBHOOK_URL** после первого деплоя
- **Проверьте права** Vercel токена для деплоя
- **Мониторьте логи** в GitHub Actions и Vercel

## 🆘 Troubleshooting

### Ошибка деплоя
- Проверьте все secrets настроены правильно
- Убедитесь, что Vercel токен имеет права на деплой
- Проверьте логи в GitHub Actions

### API не работает
- Проверьте VAPI_PRIVATE_KEY в secrets
- Убедитесь, что webhook URL правильный
- Проверьте логи в Vercel Functions

### Виджет не отображается
- Проверьте VAPI_PUBLIC_KEY
- Убедитесь, что скрипт Vapi загружается
- Проверьте консоль браузера на ошибки
