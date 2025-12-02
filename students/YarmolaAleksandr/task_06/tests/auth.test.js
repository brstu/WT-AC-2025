const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const app = require('../src/app');

const prisma = new PrismaClient();

describe('Authentication API', () => {
  let testUser;

  beforeAll(async () => {
    // Clean up test data before all tests
    await prisma.refreshToken.deleteMany({});
    await prisma.meal.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test',
        },
      },
    });

    // Create a permanent test user for login tests
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'testlogin@example.com',
        password: hashedPassword,
        name: 'Test Login User',
        role: 'USER',
      },
    });

    // Login to get refresh token for testUser
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testlogin@example.com',
        password: 'password123',
      });

    testUser = {
      ...user,
      refreshToken: loginRes.body.data.refreshToken,
    };
  });

  afterAll(async () => {
    // Clean up after all tests
    await prisma.refreshToken.deleteMany({});
    await prisma.meal.deleteMany({});
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

      testUser = res.body.data;
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User 2',
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already registered');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(422);

      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test2@example.com',
          password: '12345',
          name: 'Test User',
        })
        .expect(422);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Use the permanent test user created in beforeAll
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
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid email or password');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid email or password');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: testUser.refreshToken,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: testUser.refreshToken,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Logout successful');
    });
  });
});
