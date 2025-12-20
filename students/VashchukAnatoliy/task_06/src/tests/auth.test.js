const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const app = require('../app');

const prisma = new PrismaClient();

describe('Authentication API', () => {
  let testUser;

  beforeAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test',
        },
      },
    });

    const hashedPassword = await bcrypt.hash('password123', 10);

    testUser = await prisma.user.create({
      data: {
        email: 'testlogin@example.com',
        password: hashedPassword,
        name: 'Test Login User',
        role: 'USER',
      },
    });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user.name).toBe('Test User');
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Another User',
        })
        .expect(409);
    });

    it('should fail with invalid email', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(422);
    });

    it('should fail with short password', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test2@example.com',
          password: '12345',
          name: 'Test User',
        })
        .expect(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('testlogin@example.com');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with invalid email', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should fail with invalid password', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token', async () => {
      // 🔹 ВСЕГДА получаем свежий refresh token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'password123',
        });

      const refreshToken = loginRes.body.data.refreshToken;

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'password123',
        });

      const refreshToken = loginRes.body.data.refreshToken;

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
