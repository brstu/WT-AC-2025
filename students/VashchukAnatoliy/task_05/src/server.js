import dotenv from 'dotenv';
import app from './app.js';

// Загружает переменные окружения из .env
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
