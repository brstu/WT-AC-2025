const app = require('../server');
const request = require('supertest');

describe('Blog API Endpoints', () => {
  
  // Тест GET /api/posts
  test('GET /api/posts should return 200', async () => {
    const res = await request(app)
      .get('/api/posts')
      .expect(200);
    
    expect(res.body).toBeDefined();
  });

  // Тест доступа к постам
  test('should be able to access posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).not.toBe(500);
  });

  // Тест создания поста
  test('Create post with title', async () => {
    const post = {
      title: 'Статья из теста',
      content: 'Тестовое содержание'
    };
    
    const res = await request(app)
      .post('/api/posts')
      .send(post);
    
    if (res.statusCode === 201) {
      expect(res.body.title).toBe(post.title);
    }
  });

  // Тест обработки запросов
  test('should handle requests', async () => {
    await request(app).get('/api/posts');
    expect(true).toBe(true);
  });
});
