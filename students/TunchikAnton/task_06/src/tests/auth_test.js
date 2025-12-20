const request = require('supertest');
const app = require('../src/server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_jwt_key_for_development';
const JWT_REFRESH_SECRET = 'your_super_secret_refresh_key_for_development';

describe('Аутентификация API', () => {
  beforeEach(async () => {
    await testPrisma.refreshToken.deleteMany();
    await testPrisma.user.deleteMany();
  });

  test('POST /api/auth/signup - успешная регистрация', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!'
      })
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.user.username).toBe('testuser');
    expect(response.body.user.role).toBe('USER');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  test('POST /api/auth/signup - ошибка при дубликате email', async () => {
    await createTestUser('test@example.com', 'user1');

    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        username: 'newuser',
        password: 'Test123!'
      })
      .expect(400);

    expect(response.body.error).toBe('User with this email or username already exists');
  });

  test('POST /api/auth/signup - ошибка валидации', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'invalid-email',
        username: 'ab', // слишком короткий
        password: '123' // слишком короткий
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation error');
    expect(response.body.details).toBeInstanceOf(Array);
  });

  test('POST /api/auth/login - успешный вход', async () => {
    const hashedPassword = await bcrypt.hash('Test123!', 12);
    await testPrisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        role: 'USER'
      }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!'
      })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  test('POST /api/auth/login - неверные учетные данные', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/auth/refresh - успешное обновление токена', async () => {
    const user = await createTestUser('test@example.com', 'testuser');
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await testPrisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
  });

  test('POST /api/auth/refresh - неверный refresh токен', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);

    expect(response.body.error).toBe('Invalid or expired refresh token');
  });

  test('GET /api/auth/me - получение текущего пользователя', async () => {
    const user = await createTestUser('test@example.com', 'testuser');
    
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe('test@example.com');
    expect(response.body.username).toBe('testuser');
  });

  test('GET /api/auth/me - ошибка без токена', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .expect(401);

    expect(response.body.error).toBe('Authorization token required');
  });
});