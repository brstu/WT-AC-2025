const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const { hashResetToken } = require('../src/utils/passwordReset');
const { clearSentEmails, getLastSentEmail } = require('../src/utils/emailStub');

const prisma = new PrismaClient();

describe('Password Reset Flow', () => {
  let testUser;
  let resetToken;

  beforeAll(async () => {
    // Clean up database
    await prisma.refreshToken.deleteMany();
    await prisma.meal.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const response = await request(app).post('/api/v1/auth/signup').send({
      email: 'resettest@example.com',
      password: 'oldPassword123',
      name: 'Reset Test User',
    });

    testUser = response.body.data.user;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.refreshToken.deleteMany();
    await prisma.meal.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(() => {
    clearSentEmails();
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    test('should send reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link has been sent');

      // Check if email was "sent"
      const lastEmail = getLastSentEmail();
      expect(lastEmail).toBeDefined();
      expect(lastEmail.to).toBe(testUser.email);
      expect(lastEmail.subject).toContain('Password Reset');

      // In development, token is returned
      if (process.env.NODE_ENV !== 'production') {
        expect(response.body.resetToken).toBeDefined();
        resetToken = response.body.resetToken;
      }

      // Verify token saved in database
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
      expect(new Date(user.resetPasswordExpires)).toBeInstanceOf(Date);
      expect(user.resetPasswordExpires > new Date()).toBe(true); // Token not expired
    });

    test('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link has been sent');

      // Email should not be sent
      const lastEmail = getLastSentEmail();
      expect(lastEmail).toBeNull();
    });

    test('should return 422 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    test('should return 422 when email is missing', async () => {
      const response = await request(app).post('/api/v1/auth/forgot-password').send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    beforeEach(async () => {
      // Request password reset to get token
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: testUser.email,
        });

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
      expect(response.body.message).toContain('Password reset successful');

      // Verify password changed - try to login with new password
      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: newPassword,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);

      // Verify token cleared from database
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
          token: 'invalid-token-12345',
          newPassword: 'newPassword789',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid or expired');
    });

    test('should return 400 for expired token', async () => {
      // Manually set expired token
      const expiredToken = 'expired-token-12345';
      const hashedToken = hashResetToken(expiredToken);

      await prisma.user.update({
        where: { email: testUser.email },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: new Date(Date.now() - 3600000), // 1 hour ago
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
      expect(response.body.error.message).toContain('Invalid or expired');
    });

    test('should return 422 for short password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '123', // Too short
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    test('should return 422 when token is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          newPassword: 'newPassword999',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    test('should return 422 when newPassword is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    test('should invalidate refresh tokens after password reset', async () => {
      // First reset password to newPassword456 (from previous test)
      const forgotResponse = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      const token = forgotResponse.body.resetToken;

      // Login to get refresh token (with newPassword456 from earlier test)
      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'newPassword456',
      });

      const refreshToken = loginResponse.body.data.refreshToken;

      // Reset password to newPassword789
      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token,
          newPassword: 'newPassword789',
        });

      // Try to use old refresh token
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        });

      expect(refreshResponse.status).toBe(401);
      expect(refreshResponse.body.success).toBe(false);
    });
  });

  describe('Email Stub Functionality', () => {
    test('should log email details in development', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      if (process.env.NODE_ENV !== 'production') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    test('should include reset URL in email', async () => {
      await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      const lastEmail = getLastSentEmail();
      expect(lastEmail.text).toContain('reset');
      expect(lastEmail.text).toContain('password');
      expect(lastEmail.html).toContain('reset');
    });
  });
});
