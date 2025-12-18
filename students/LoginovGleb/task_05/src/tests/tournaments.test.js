const request = require('supertest');
const app = require('../index');
const storage = require('../data/storage');

describe('Tournaments API', () => {
  beforeEach(() => {
    storage.resetData();
  });

  describe('GET /api/v1/tournaments', () => {
    it('should return paginated list of tournaments', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.pagination).toHaveProperty('offset');
      expect(res.body.pagination).toHaveProperty('hasMore');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by search query', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments?q=ESL')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name.toLowerCase()).toContain('esl');
    });

    it('should filter by game', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments?game=CS2')
        .expect(200);

      res.body.data.forEach(t => {
        expect(t.game.toLowerCase()).toBe('cs2');
      });
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments?status=upcoming')
        .expect(200);

      res.body.data.forEach(t => {
        expect(t.status).toBe('upcoming');
      });
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments?limit=1&offset=0')
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.pagination.offset).toBe(0);
    });

    it('should support sorting', async () => {
      const resAsc = await request(app)
        .get('/api/v1/tournaments?sortBy=name&order=asc')
        .expect(200);

      const resDesc = await request(app)
        .get('/api/v1/tournaments?sortBy=name&order=desc')
        .expect(200);

      if (resAsc.body.data.length > 1) {
        expect(resAsc.body.data[0].name).not.toBe(resDesc.body.data[0].name);
      }
    });

    it('should support sorting by date', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments?sortBy=startDate&order=desc')
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should support sorting by prizePool', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments?sortBy=prizePool&order=desc')
        .expect(200);

      if (res.body.data.length > 1) {
        expect(res.body.data[0].prizePool).toBeGreaterThanOrEqual(res.body.data[1].prizePool);
      }
    });

    it('should return 422 for invalid limit', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments?limit=invalid')
        .expect(422);

      expect(res.body.status).toBe('fail');
    });
  });

  describe('GET /api/v1/tournaments/:id', () => {
    it('should return a tournament by id', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments/t1')
        .expect(200);

      expect(res.body).toHaveProperty('id', 't1');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('game');
    });

    it('should return 404 for non-existent tournament', async () => {
      const res = await request(app)
        .get('/api/v1/tournaments/nonexistent')
        .expect(404);

      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('не найден');
    });
  });

  describe('POST /api/v1/tournaments', () => {
    const validTournament = {
      name: 'Test Tournament',
      game: 'CS2',
      startDate: '2025-03-01T10:00:00Z',
      endDate: '2025-03-05T18:00:00Z',
      prizePool: 100000,
      maxTeams: 16,
      status: 'upcoming'
    };

    it('should create a new tournament', async () => {
      const res = await request(app)
        .post('/api/v1/tournaments')
        .send(validTournament)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(validTournament.name);
      expect(res.body.game).toBe(validTournament.game);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/tournaments')
        .send({ name: 'Test' })
        .expect(422);

      expect(res.body.status).toBe('fail');
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 422 for invalid date format', async () => {
      const res = await request(app)
        .post('/api/v1/tournaments')
        .send({
          ...validTournament,
          startDate: 'invalid-date'
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 when end date is before start date', async () => {
      const res = await request(app)
        .post('/api/v1/tournaments')
        .send({
          ...validTournament,
          startDate: '2025-03-10T10:00:00Z',
          endDate: '2025-03-01T10:00:00Z'
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for name exceeding max length', async () => {
      const res = await request(app)
        .post('/api/v1/tournaments')
        .send({
          ...validTournament,
          name: 'a'.repeat(101)
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });
  });

  describe('PUT /api/v1/tournaments/:id', () => {
    const updateData = {
      name: 'Updated Tournament',
      game: 'Valorant',
      startDate: '2025-04-01T10:00:00Z',
      endDate: '2025-04-10T18:00:00Z',
      prizePool: 200000,
      maxTeams: 24,
      status: 'upcoming'
    };

    it('should fully update a tournament', async () => {
      const res = await request(app)
        .put('/api/v1/tournaments/t1')
        .send(updateData)
        .expect(200);

      expect(res.body.name).toBe(updateData.name);
      expect(res.body.game).toBe(updateData.game);
      expect(res.body.id).toBe('t1');
    });

    it('should return 404 for non-existent tournament', async () => {
      const res = await request(app)
        .put('/api/v1/tournaments/nonexistent')
        .send(updateData)
        .expect(404);

      expect(res.body.status).toBe('fail');
    });
  });

  describe('PATCH /api/v1/tournaments/:id', () => {
    it('should partially update a tournament', async () => {
      const res = await request(app)
        .patch('/api/v1/tournaments/t1')
        .send({ status: 'ongoing' })
        .expect(200);

      expect(res.body.status).toBe('ongoing');
      expect(res.body.id).toBe('t1');
    });

    it('should return 422 for empty update', async () => {
      const res = await request(app)
        .patch('/api/v1/tournaments/t1')
        .send({})
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 404 for non-existent tournament', async () => {
      const res = await request(app)
        .patch('/api/v1/tournaments/nonexistent')
        .send({ status: 'ongoing' })
        .expect(404);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for invalid startDate format in PATCH', async () => {
      const res = await request(app)
        .patch('/api/v1/tournaments/t1')
        .send({ startDate: 'not-a-date' })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for invalid endDate format in PATCH', async () => {
      const res = await request(app)
        .patch('/api/v1/tournaments/t1')
        .send({ endDate: 'invalid' })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 when endDate before startDate in PATCH', async () => {
      const res = await request(app)
        .patch('/api/v1/tournaments/t1')
        .send({
          startDate: '2025-03-10T10:00:00Z',
          endDate: '2025-03-01T10:00:00Z'
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });
  });

  describe('DELETE /api/v1/tournaments/:id', () => {
    it('should delete a tournament', async () => {
      await request(app)
        .delete('/api/v1/tournaments/t1')
        .expect(204);

      // Verify deletion
      await request(app)
        .get('/api/v1/tournaments/t1')
        .expect(404);
    });

    it('should return 404 for non-existent tournament', async () => {
      const res = await request(app)
        .delete('/api/v1/tournaments/nonexistent')
        .expect(404);

      expect(res.body.status).toBe('fail');
    });
  });
});
