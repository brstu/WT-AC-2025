const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    // Очищаем таблицы перед каждым тестом
    await prisma.refreshToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('должен успешно зарегистрировать нового пользователя', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Тест',
          lastName: 'Тестов',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('должен вернуть ошибку при регистрации с существующим email', async () => {
      // Создаем первого пользователя
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Тест',
          lastName: 'Тестов',
        });

      // Пытаемся создать второго с тем же email
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password456',
          firstName: 'Тест2',
          lastName: 'Тестов2',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('уже существует');
    });

    it('должен вернуть ошибку валидации при неверных данных', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: '123', // слишком короткий
          firstName: '',
          lastName: 'Тестов',
        });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Создаем пользователя для тестов входа
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'login@example.com',
          password: 'password123',
          firstName: 'Логин',
          lastName: 'Тестов',
        });
    });

    it('должен успешно авторизовать пользователя', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('должен вернуть ошибку при неверном пароле', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Неверный email или пароль');
    });

    it('должен вернуть ошибку при несуществующем email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Неверный email или пароль');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Создаем пользователя и получаем refresh token
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'refresh@example.com',
          password: 'password123',
          firstName: 'Рефреш',
          lastName: 'Тестов',
        });

      refreshToken = response.body.refreshToken;
    });

    it('должен успешно обновить access token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('должен вернуть ошибку при недействительном refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let refreshToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'logout@example.com',
          password: 'password123',
          firstName: 'Логаут',
          lastName: 'Тестов',
        });

      refreshToken = response.body.refreshToken;
    });

    it('должен успешно выполнить logout', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('успешно');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'forgot@example.com',
          password: 'password123',
          firstName: 'Забыл',
          lastName: 'Пароль',
        });
    });

    it('должен отправить запрос на сброс пароля', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'forgot@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      // В development режиме должен вернуть токен
      if (process.env.NODE_ENV === 'development') {
        expect(response.body).toHaveProperty('resetToken');
      }
    });

    it('должен вернуть то же сообщение для несуществующего email (безопасность)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'reset@example.com',
          password: 'oldpassword123',
          firstName: 'Сброс',
          lastName: 'Пароля',
        });

      const forgotResponse = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'reset@example.com' });

      resetToken = forgotResponse.body.resetToken;
    });

    it('должен успешно сбросить пароль', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('успешно');

      // Проверяем, что можем войти с новым паролем
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'reset@example.com',
          password: 'newpassword123',
        });

      expect(loginResponse.status).toBe(200);
    });

    it('должен вернуть ошибку при недействительном токене', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(404);
    });
  });
});
