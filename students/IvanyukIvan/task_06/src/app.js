const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const wordsRoutes = require('./routes/words.routes');
const { prisma } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Защита Helmet
app.use(helmet());

// Лимит запросов
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 минут
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Слишком много запросов с этого IP, попробуйте позже'
});
app.use('/api/', limiter);

// Парсинг JSON
app.use(express.json({ limit: process.env.MAX_BODY_SIZE || '10mb' }));

// Парсинг URL-encoded
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_BODY_SIZE || '10mb' }));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/words', wordsRoutes);

// Проверка работы API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Language Tracker API работает',
    timestamp: new Date().toISOString()
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Запуск сервера
const startServer = async () => {
  try {
    // Проверяем подключение к БД
    await prisma.$connect();
    console.log('✅ Подключение к базе данных установлено');

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📚 API доступно по адресу http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

// Обработка завершения
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('✅ Подключение к базе данных закрыто');
  process.exit(0);
});

startServer();