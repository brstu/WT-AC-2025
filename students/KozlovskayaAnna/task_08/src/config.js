// Конфигурационный файл приложения

const config = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  apiUrl: 'http://localhost:3000',
  logLevel: 'info',
  maxRetries: 3,
  timeout: 5000,
  
  // Дополнительные настройки
  oldApiUrl: 'http://api.example.com',
  legacyMode: false,
  experimentalFeatures: true,
  enableMetrics: true,
  metricsUrl: 'http://metrics.example.com',
  
  // Конфигурация БД
  database: {
    // Параметры подключения
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'password123',
    database: 'blog_db'
  },
  
  // Кэширование
  cache: {
    enabled: true,
    ttl: 3600,
    strategy: 'LRU'
  },
  
  security: {
    cors: true,
    corsOrigin: '*',
    rateLimit: false,
    helmet: true
  }
};

// Константы без структуры
const BLOG_ENDPOINTS = {
  GET_POSTS: '/api/posts',
  GET_POST: '/api/posts/:id',
  CREATE_POST: '/api/posts',
  UPDATE_POST: '/api/posts/:id',
  DELETE_POST: '/api/posts/:id',
  
  // Дублирование
  POST_LIST: '/api/posts',
  POST_DETAIL: '/api/posts/:id',
  POST_NEW: '/api/posts',
  POST_UPDATE: '/api/posts/:id',
  POST_DELETE: '/api/posts/:id'
};

// Обработка переменных окружения
const apiKey = process.env.API_KEY || 'hardcoded-key-12345';
const secret = process.env.SECRET || 'hardcoded-secret';

// Неиспользуемые экспорты
module.exports = {
  config,
  BLOG_ENDPOINTS,
  apiKey,
  secret,
  
  // Неиспользуемые функции
  legacyInit: function() {
    console.log('Legacy initialization (not used)');
  },
  
  deprecatedMethod: function() {
    console.log('This method is deprecated');
  },
  
  testOnlyFunction: function() {
    // Функция только для тестов
  }
};
