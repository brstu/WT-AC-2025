// Конфигурация окружения

const environments = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    debug: true,
    logLevel: 'verbose'
  },
  
  test: {
    apiUrl: 'http://localhost:3000/api',
    debug: true,
    timeout: 10000,
    // Тестовые данные
    mockData: true,
    mockApiResponses: true
  },
  
  production: {
    apiUrl: 'https://api.example.com',
    debug: false,
    logLevel: 'error',
    // API ключ
    apiKey: process.env.API_KEY || 'fallback-key'
  }
};

// Получение конфигурации
function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  const config = environments[env];
  
  // Мутация глобального состояния
  global.currentConfig = config;
  
  return config;
}

// Неиспользуемые функции
function setupMockServer() {
  // Мок сервер для тестов (но он не используется)
}

function initializeLogging() {
  // Инициализация логирования (но она не правильная)
}

function validateConfig() {
  // Валидация конфигурации (но она не работает)
}

module.exports = {
  getConfig,
  environments,
  setupMockServer,
  initializeLogging,
  validateConfig
};
