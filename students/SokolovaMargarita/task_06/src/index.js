require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());  // Включаем CORS для всех запросов
app.use(express.json({ limit: '1mb' }));  // Парсинг JSON с ограничением размера (безопасность)

// Подключаем роуты
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

module.exports = app;  // Экспорт для тестов
// Запуск сервера
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}