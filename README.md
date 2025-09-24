# AI Restaurant Agent — Admin Dashboard (Next.js + Firebase)

Админ‑панель для AI‑агента ресторана: показывает бронирования, звонки, логи диалогов, конверсию и KPI. Поддерживает многозадачность по языкам, интеграцию с n8n и Firestore, работает в реальном времени.

## 1) Что умеет

- Живые метрики: бронирования, конверсия Call → Booking, воронка (Calls → Intents → Bookings)
- Разбивка по каналам: Call / Website / WhatsApp
- KPI: AHT (средняя длительность звонков), Confirmed/Cancelled, повторные звонки
- Heatmap загрузки по часам/дням недели
- Управление: создать/подтвердить/отменить/перенести бронь, уведомить администратора
- Мультиязычность (en/ru/hr/es) и маршруты `/{lang}/...`
- Интеграции: n8n вебхуки для логов/бронирований/уведомлений

## 2) Быстрый старт

### Локальная разработка (без Docker)

You can run the development server using npm:

```bash
npm run dev
```

Or using Docker:

```bash
# Build and start the Docker container
docker-compose up
```

Откройте `http://localhost:3000`.

## 3) Docker

This project includes Docker configuration for both development and production environments.

### Development with Docker

The `docker-compose.yml` file is configured for development with hot reloading:

```bash
# Start the development environment
docker-compose up

# Stop the development environment
docker-compose down
```

### Production Build

To build and run the production version:

```bash
# Build the production Docker image
docker build -t restaurant-dashboard .

# Run the production container
docker run -p 3000:3000 restaurant-dashboard
```

## 4) Firebase и индексы

Создайте проект Firebase или используйте существующий (например, `booking-2c3e1`).

1. Установите CLI и залогиньтесь:
```bash
npm i -g firebase-tools
firebase login --no-localhost
firebase use --add <PROJECT_ID>
```
2. Задеплойте индексы (нужны для периодных запросов):
```bash
firebase deploy --only firestore:indexes --project <PROJECT_ID>
```
3. Проведите backfill `createdAt` для старых записей (один раз):
```bash
curl -X POST "http://localhost:3000/api/admin/backfill-createdAt?collection=logs"
curl -X POST "http://localhost:3000/api/admin/backfill-createdAt?collection=bookings"
```

## 5) Переменные окружения

Добавьте в `.env.local` (локально) или в Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# n8n уведомления (для кнопки Notify admin)
N8N_NOTIFY_URL=https://<your-n8n>/webhook/<id>
N8N_NOTIFY_SECRET=<optional>
```

## 6) Вебхуки n8n

Эндпоинты для связи с n8n:

- Создать бронь:
```bash
POST /api/n8n/bookings
{ "name":"John", "date":"2025-09-24", "status":"Confirmed", "channel":"Call" }
```
- Сохранить лог звонка:
```bash
POST /api/n8n/logs
{ "callId":"abc", "clientNumber":"+385...", "channel":"Call", "status":"intent_detected", "timestamp":"2025-09-24T12:00:00Z", "durationSec":11, "dialog":[{"role":"user","message":"..."}] }
```
- Уведомить администратора (проксирует в ваш n8n):
```bash
POST /api/n8n/notify
{ "bookingId":"...", "message":"..." }
```

Все записи помечаются `createdAt` и сразу попадают в виджеты и таблицы.

## 7) Админ‑панель: основные разделы

- Dashboard: метрики, воронка, каналы, KPI, heatmap, быстрые действия
- Bookings: список и фильтры (Status/Channel/Period/Sort)
- Logs: полнотекстовый поиск, фильтр по каналу

## 8) Мультиязык

Строки находятся в `src/app/i18n/{en,ru,hr,es}.ts`. Текущий язык определяется URL‑сегментом `/{lang}/...` и сохраняется в cookies/localStorage. Переключение в Settings.

## 9) Разработка и тесты

- Сидеры:
```bash
POST /api/logs/seed
POST /api/knowledge/seed
POST /api/bookings/seed
```
- Локальный тест метрик: добавьте несколько `logs`/`bookings` с `createdAt`, обновите Dashboard.

## 10) CI/CD

This project uses GitHub Actions for CI/CD. The workflow is defined in `.github/workflows/ci-cd.yml`.

The pipeline:
1. Builds and tests the application on every push to main/master and on pull requests
2. Deploys to Vercel automatically on successful builds from the main/master branch

### Required GitHub Secrets

To enable the CI/CD pipeline, add these secrets to your GitHub repository:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `VERCEL_ORG_ID`: Your Vercel organization ID

## 11) Deploy на Vercel

The project is configured for deployment on Vercel with the `vercel.json` configuration file.

### Environment variables

Set these in Vercel Project Settings → Environment Variables (Scope: Production and Preview):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

Locally, copy them into a `.env.local` file at the project root.

### Manual Deployment

You can deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

### Automatic Deployment

Pushes to the main/master branch will automatically trigger a deployment through the GitHub Actions workflow.

## 12) Структура проекта

- `src/app`: Next.js application code
- `public`: Static assets
- `Dockerfile`: Docker configuration for building the application
- `docker-compose.yml`: Docker Compose configuration for development
- `.github/workflows`: CI/CD configuration
- `vercel.json`: Vercel deployment configuration

## 13) Частые проблемы

- Конверсия/воронка пустые: проверьте `createdAt` у документов, разверните индексы, смените период (7/30 дней).
- zsh ругается на `?` в URL: оборачивайте URL в кавычки: `"http://...?...=..."`.
- AHT пустой: добавьте `durationSec` или `durationMs` в `logs`.

## 14) Безопасность

- Вебхуки n8n опционально защищаются заголовком `X-Webhook-Secret`.
- Для CLI‑деплоя используйте `firebase login --no-localhost` или `firebase login:ci`.
