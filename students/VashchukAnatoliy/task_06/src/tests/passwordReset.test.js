const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const { hashResetToken } = require('../utils/passwordReset');
const { clearSentEmails, getLastSentEmail } = require('../utils/emailStub');

const prisma = new PrismaClient();

describe('Password Reset Flow', () => {
  let testUser;
  let resetToken;

  beforeAll(async () => {
    // Clean up database
    await prisma.refreshToken.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'resettest@example.com',
        password: 'oldPassword123',
        name: 'Reset Test User',
      });

    testUser = response.body.data.user;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(() => {
    clearSentEmails();
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    test('should send reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const lastEmail = getLastSentEmail();
      expect(lastEmail).toBeDefined();
      expect(lastEmail.to).toBe(testUser.email);

      if (process.env.NODE_ENV !== 'production') {
        expect(response.body.resetToken).toBeDefined();
        resetToken = response.body.resetToken;
      }

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
      expect(user.resetPasswordExpires > new Date()).toBe(true);
    });

    test('should return success even for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nope@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const lastEmail = getLastSentEmail();
      expect(lastEmail).toBeNull();
    });

    test('should return 422 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    test('should return 422 when email missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      if (process.env.NODE_ENV !== 'production') {
        resetToken = response.body.resetToken;
      }
    });

    test('should reset password with valid token', async () => {
      const newPassword = 'newPassword456';

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user.resetPasswordToken).toBeNull();
      expect(user.resetPasswordExpires).toBeNull();
    });

    test('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newPassword789',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for expired token', async () => {
      const expiredToken = 'expired-token';
      const hashedToken = hashResetToken(expiredToken);

      await prisma.user.update({
        where: { email: testUser.email },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: new Date(Date.now() - 3600000),
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'newPassword999',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 422 for short password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '123',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Email Stub', () => {
    test('should log email in development', async () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      if (process.env.NODE_ENV !== 'production') {
        expect(spy).toHaveBeenCalled();
      }

      spy.mockRestore();
    });

    test('should include reset info in email', async () => {
      await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      const lastEmail = getLastSentEmail();
      expect(lastEmail.text).toContain('reset');
      expect(lastEmail.html).toContain('reset');
    });
  });
});
