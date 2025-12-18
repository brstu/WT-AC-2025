const request = require('supertest');
const app = require('./app');

describe('Auth', () => {
  it('should signup and login a user', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'testpass123';

    // Signup
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email, password });

    expect(signupRes.status).toBe(200);
    expect(signupRes.body.email).toBe(email);

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();
  }, 20000);
});