#!/usr/bin/env node

/**
 * Примеры использования Gadgets & Reviews API
 * Демонстрирует основные CRUD операции и возможности API
 */

const API_BASE = 'http://localhost:3000/api/v1';

// Функция для выполнения HTTP запросов (для Node.js без зависимостей)
async function makeRequest(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  
  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

// Вспомогательная функция для логирования
function log(title, data) {
  console.log('\n' + '='.repeat(50));
  console.log(`📋 ${title}`);
  console.log('='.repeat(50));
  console.log(JSON.stringify(data, null, 2));
}

async function demoAPI() {
  try {
    console.log('🚀 Демонстрация Gadgets & Reviews API');
    console.log(`🔗 Базовый URL: ${API_BASE}`);

    // 1. Health Check
    const health = await makeRequest('http://localhost:3000/health');
    log('Health Check', health.data);

    // 2. Создание нескольких гаджетов
    const gadgets = [
      {
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        category: 'smartphone',
        price: 1199.99,
        rating: 4.9,
        description: 'Флагманский смартфон Apple с титановым корпусом',
        releaseDate: '2023-09-22',
        inStock: true
      },
      {
        name: 'MacBook Air M3',
        brand: 'Apple',
        category: 'laptop',
        price: 1299.99,
        rating: 4.8,
        description: 'Ультратонкий ноутбук с процессором M3',
        releaseDate: '2024-03-04',
        inStock: true
      },
      {
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        category: 'headphones',
        price: 399.99,
        rating: 4.7,
        description: 'Премиальные наушники с шумоподавлением',
        releaseDate: '2022-05-12',
        inStock: false
      }
    ];

    console.log('\n🔨 Создание гаджетов...');
    const createdGadgets = [];
    
    for (const gadget of gadgets) {
      const response = await makeRequest(`${API_BASE}/gadgets`, {
        method: 'POST',
        body: JSON.stringify(gadget)
      });
      
      if (response.ok) {
        createdGadgets.push(response.data.data);
        console.log(`✅ Создан: ${gadget.name} (ID: ${response.data.data.id})`);
      }
    }

    // 3. Получение списка всех гаджетов
    const allGadgets = await makeRequest(`${API_BASE}/gadgets`);
    log('Все гаджеты с пагинацией', allGadgets.data);

    // 4. Поиск по тексту
    const searchResult = await makeRequest(`${API_BASE}/gadgets?q=Apple`);
    log('Поиск по запросу "Apple"', searchResult.data);

    // 5. Фильтрация по категории
    const smartphoneFilter = await makeRequest(`${API_BASE}/gadgets?category=smartphone`);
    log('Фильтр по категории "smartphone"', smartphoneFilter.data);

    // 6. Фильтрация по цене
    const priceFilter = await makeRequest(`${API_BASE}/gadgets?minPrice=1000&maxPrice=1500`);
    log('Фильтр по цене ($1000-$1500)', priceFilter.data);

    // 7. Сортировка по цене (по убыванию)
    const sortedByPrice = await makeRequest(`${API_BASE}/gadgets?sortBy=price&sortOrder=desc`);
    log('Сортировка по цене (убывание)', sortedByPrice.data);

    // 8. Получение конкретного гаджета
    if (createdGadgets.length > 0) {
      const gadgetDetail = await makeRequest(`${API_BASE}/gadgets/${createdGadgets[0].id}`);
      log(`Детали гаджета (ID: ${createdGadgets[0].id})`, gadgetDetail.data);
    }

    // 9. Обновление гаджета (PATCH)
    if (createdGadgets.length > 0) {
      const updateResponse = await makeRequest(`${API_BASE}/gadgets/${createdGadgets[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          price: 1099.99,
          rating: 5.0,
          description: 'ОБНОВЛЕНО: Топовый смартфон Apple с улучшенными характеристиками'
        })
      });
      log('Обновление гаджета (PATCH)', updateResponse.data);
    }

    // 10. Статистика
    const stats = await makeRequest(`${API_BASE}/gadgets/stats`);
    log('Статистика коллекции', stats.data);

    // 11. Тестирование валидации (создание невалидного гаджета)
    const invalidGadget = await makeRequest(`${API_BASE}/gadgets`, {
      method: 'POST',
      body: JSON.stringify({
        name: '', // Пустое название
        brand: 'Samsung',
        category: 'invalid_category', // Неверная категория
        price: -100 // Отрицательная цена
      })
    });
    log('Тест валидации (ошибка 422)', invalidGadget.data);

    // 12. Тестирование 404 ошибки
    const notFound = await makeRequest(`${API_BASE}/gadgets/123e4567-e89b-12d3-a456-426614174000`);
    log('Тест 404 ошибки', notFound.data);

    // 13. Удаление гаджета
    if (createdGadgets.length > 1) {
      const deleteResponse = await makeRequest(`${API_BASE}/gadgets/${createdGadgets[1].id}`, {
        method: 'DELETE'
      });
      console.log(`\n🗑️  Гаджет удален: ${createdGadgets[1].name} (Статус: ${deleteResponse.status})`);
    }

    // 14. Финальная статистика
    const finalStats = await makeRequest(`${API_BASE}/gadgets/stats`);
    log('Финальная статистика', finalStats.data);

    console.log('\n✨ Демонстрация завершена!');
    console.log('📚 Полная документация: http://localhost:3000/docs');

  } catch (error) {
    console.error('❌ Ошибка демонстрации:', error.message);
    console.log('\n💡 Убедитесь, что сервер запущен: npm start');
  }
}

// Запуск демонстрации
if (require.main === module) {
  demoAPI().catch(console.error);
}

module.exports = { demoAPI };