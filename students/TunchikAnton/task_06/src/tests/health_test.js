const request = require('supertest');
const app = require('../src/server');

describe('Health Check', () => {
  test('GET /health - проверка работоспособности', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
    expect(response.body.timestamp).toBeDefined();
  });

  test('404 для неизвестного маршрута', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body.error).toBe('Endpoint not found');
  });
});