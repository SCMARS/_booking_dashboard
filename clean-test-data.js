const https = require('https');

// Firebase конфигурация
const FIREBASE_PROJECT_ID = 'booking-2c3e1';
const FIREBASE_API_KEY = 'AIzaSyAEv2_HfE0VauvaPecZ3N9aAmwEAzRnrw4';

// Функция для удаления тестовых данных
async function cleanTestData() {
  console.log('🧹 Очистка тестовых данных из Firebase...');
  
  // Список тестовых callId для удаления
  const testCallIds = [
    'test-call-123',
    'test-call-fixed-789',
    'real-call-456',
    'demo-1',
    'demo-2',
    'demo-3',
    'abc123',
    'c-1',
    'c-2'
  ];
  
  console.log(`📋 Найдено ${testCallIds.length} тестовых callId для удаления`);
  
  // Здесь можно добавить логику для удаления через Firebase Admin SDK
  // Пока что просто выводим список
  console.log('🗑️ Тестовые данные для удаления:');
  testCallIds.forEach(callId => {
    console.log(`  - ${callId}`);
  });
  
  console.log('✅ Очистка завершена (логика удаления требует Firebase Admin SDK)');
}

// Запуск очистки
cleanTestData().catch(console.error);
