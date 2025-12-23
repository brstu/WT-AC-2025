const request = require('supertest');

// Создаем тестовый сервер
const createTestServer = () => {
  const express = require('express');
  const app = express();
  
  const memes = [
    {
      id: '1',
      name: 'Doge',
      url: 'https://i.imgflip.com/4t0m5.jpg',
      likes: 1500,
      views: 10000,
      description: 'Much wow such meme',
      tags: ['doge', 'dog', 'shiba', 'funny']
    },
    {
      id: '2',
      name: 'Grumpy Cat',
      url: 'https://i.imgflip.com/1h7in3.jpg',
      likes: 1200,
      views: 8000,
      description: 'I had fun once. It was awful.',
      tags: ['cat', 'grumpy', 'funny', 'animal']
    }
  ];

  app.use(require('cors')());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Memes Gallery API'
    });
  });

  app.get('/api/memes', (req, res) => {
    const { search } = req.query;
    let result = [...memes];

    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter(meme => 
        meme.name.toLowerCase().includes(searchTerm) ||
        meme.tags.some(tag => tag.includes(searchTerm))
      );
    }

    res.json(result);
  });

  app.get('/api/memes/:id', (req, res) => {
    const meme = memes.find(m => m.id === req.params.id);
    if (meme) {
      res.json(meme);
    } else {
      res.status(404).json({ error: 'Meme not found' });
    }
  });

  app.post('/api/memes/:id/like', (req, res) => {
    const meme = memes.find(m => m.id === req.params.id);
    if (meme) {
      meme.likes += 1;
      res.json({ 
        success: true, 
        memeId: meme.id, 
        likes: meme.likes 
      });
    } else {
      res.status(404).json({ error: 'Meme not found' });
    }
  });

  return app;
};

describe('Memes API Tests', () => {
  let app;
  let server;

  beforeAll(() => {
    app = createTestServer();
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  test('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
  });

  test('should return all memes', async () => {
    const response = await request(app).get('/api/memes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
  });

  test('should search memes', async () => {
    const response = await request(app).get('/api/memes?search=doge');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Doge');
  });

  test('should get meme by ID', async () => {
    const response = await request(app).get('/api/memes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
    expect(response.body).toHaveProperty('name', 'Doge');
  });

  test('should return 404 for non-existent meme', async () => {
    const response = await request(app).get('/api/memes/999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Meme not found');
  });

  test('should like a meme', async () => {
    const response = await request(app)
      .post('/api/memes/1/like');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('memeId', '1');
    expect(response.body.likes).toBe(1501);
  });

  test('should handle like for non-existent meme', async () => {
    const response = await request(app)
      .post('/api/memes/999/like');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Meme not found');
  });
});