const request = require('supertest');
const app = require('../index');
const storage = require('../data/storage');

describe('Galleries API', () => {
  beforeEach(() => {
    storage.resetData();
  });

  describe('GET /api/v1/galleries', () => {
    it('should return paginated list of galleries', async () => {
      const res = await request(app)
        .get('/api/v1/galleries')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by search query', async () => {
      const res = await request(app)
        .get('/api/v1/galleries?q=Modern')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by artType', async () => {
      const res = await request(app)
        .get('/api/v1/galleries?artType=Painting')
        .expect(200);

      res.body.data.forEach(g => {
        expect(g.artType).toBe('Painting');
      });
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/v1/galleries?category=modern')
        .expect(200);

      res.body.data.forEach(g => {
        expect(g.category).toBe('modern');
      });
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/galleries?limit=2&offset=0')
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should support sorting by likes desc', async () => {
      const res = await request(app)
        .get('/api/v1/galleries?sortBy=likes&order=desc')
        .expect(200);

      if (res.body.data.length > 1) {
        expect(res.body.data[0].likes).toBeGreaterThanOrEqual(res.body.data[1].likes);
      }
    });
  });

  describe('GET /api/v1/galleries/:id', () => {
    it('should return gallery by id', async () => {
      const res = await request(app)
        .get('/api/v1/galleries/g1')
        .expect(200);

      expect(res.body.id).toBe('g1');
    });

    it('should return 404 for non-existent', async () => {
      await request(app)
        .get('/api/v1/galleries/nonexistent')
        .expect(404);
    });
  });

  describe('POST /api/v1/galleries', () => {
    const valid = {
      name: 'New Gallery',
      artType: 'Digital Art',
      startDate: '2025-12-01T10:00:00Z',
      endDate: '2025-12-31T18:00:00Z'
    };

    it('should create gallery', async () => {
      const res = await request(app)
        .post('/api/v1/galleries')
        .send(valid)
        .expect(201);

      expect(res.body.name).toBe(valid.name);
      expect(res.body.id).toBeDefined();
    });

    it('should validate endDate >= startDate', async () => {
      await request(app)
        .post('/api/v1/galleries')
        .send({ ...valid, endDate: '2025-11-01T10:00:00Z' })
        .expect(422);
    });
  });

  describe('PUT /api/v1/galleries/:id', () => {
    it('should fully update', async () => {
      const update = {
        name: 'Updated Gallery',
        artType: 'Sculpture',
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-01-31T23:59:59Z',
        likes: 1000000
      };

      const res = await request(app)
        .put('/api/v1/galleries/g1')
        .send(update)
        .expect(200);

      expect(res.body.name).toBe(update.name);
      expect(res.body.likes).toBe(update.likes);
    });
  });

  describe('PATCH /api/v1/galleries/:id', () => {
    it('should partially update', async () => {
      const res = await request(app)
        .patch('/api/v1/galleries/g1')
        .send({ likes: 999999 })
        .expect(200);

      expect(res.body.likes).toBe(999999);
    });

    it('should reject empty body', async () => {
      await request(app)
        .patch('/api/v1/galleries/g1')
        .send({})
        .expect(422);
    });
  });

  describe('DELETE /api/v1/galleries/:id', () => {
    it('should delete gallery', async () => {
      await request(app)
        .delete('/api/v1/galleries/g1')
        .expect(204);

      await request(app)
        .get('/api/v1/galleries/g1')
        .expect(404);
    });
  });

  describe('POST /api/v1/galleries/:id/like', () => {
    it('should increment likes', async () => {
      const original = storage.getGalleryById('g1');
      const res = await request(app)
        .post('/api/v1/galleries/g1/like')
        .expect(200);

      expect(res.body.likes).toBe(original.likes + 1);
    });

    it('should return 404 for non-existent', async () => {
      await request(app)
        .post('/api/v1/galleries/nonexistent/like')
        .expect(404);
    });
  });
});