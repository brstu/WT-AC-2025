const { execSync } = require('child_process');
const path = require('path');

// Устанавливаем переменную окружения для тестов
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.DATABASE_URL = 'file:./test.db';

// Инициализация тестовой базы данных перед запуском тестов
beforeAll(() => {
  try {
    // Удаляем старую тестовую БД если она существует
    const fs = require('fs');
    const dbPath = path.join(__dirname, '..', 'test.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    // Применяем миграции для тестовой БД
    execSync('npx prisma migrate deploy', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./test.db' }
    });
  } catch (error) {
    console.error('Failed to setup test database:', error);
  }
});
