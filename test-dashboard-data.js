const https = require('https');

// Тестирование обновленных запросов дашборда
async function testDashboardData() {
  console.log('🧪 Тестирование данных дашборда...');
  
  const baseUrl = 'http://localhost:8001/api/logs';
  
  // Тест 1: Проверка общего количества звонков
  console.log('\n📞 Тест 1: Общее количество звонков');
  try {
    const response = await fetch(`${baseUrl}?type=call_summary&limit=100`);
    const data = await response.json();
    console.log(`✅ Всего звонков: ${data.logs.length}`);
    
    // Подсчет по типам завершения
    const endedReasons = data.logs.reduce((acc, log) => {
      const reason = log.endedReason || 'unknown';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Разбивка по причинам завершения:');
    Object.entries(endedReasons).forEach(([reason, count]) => {
      console.log(`  - ${reason}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  // Тест 2: Проверка успешных звонков
  console.log('\n🎯 Тест 2: Успешные звонки');
  try {
    const response = await fetch(`${baseUrl}?type=call_summary&limit=100`);
    const data = await response.json();
    const successfulCalls = data.logs.filter(log => 
      log.endedReason === 'customer-ended-call'
    );
    console.log(`✅ Успешных звонков: ${successfulCalls.length}`);
    
    successfulCalls.forEach((call, index) => {
      console.log(`  ${index + 1}. Call ID: ${call.callId}`);
      console.log(`     Дата: ${call.createdAt}`);
      console.log(`     Суммарка: ${call.summary?.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  // Тест 3: Проверка звонков с транскриптами
  console.log('\n📝 Тест 3: Звонки с транскриптами');
  try {
    const response = await fetch(`${baseUrl}?type=call_summary&limit=100`);
    const data = await response.json();
    const callsWithTranscript = data.logs.filter(log => log.transcript);
    console.log(`✅ Звонков с транскриптами: ${callsWithTranscript.length}`);
    
    callsWithTranscript.forEach((call, index) => {
      console.log(`  ${index + 1}. Call ID: ${call.callId}`);
      console.log(`     Длина транскрипта: ${call.transcript.length} символов`);
      console.log(`     Первые 100 символов: ${call.transcript.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ Тестирование завершено!');
}

// Запуск тестов
testDashboardData().catch(console.error);
