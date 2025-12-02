const request = require('supertest');
const app = require('../index');
const storage = require('../data/storage');

describe('Teams API', () => {
  beforeEach(() => {
    storage.resetData();
  });

  describe('GET /api/v1/teams', () => {
    it('should return paginated list of teams', async () => {
      const res = await request(app)
        .get('/api/v1/teams')
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
        .get('/api/v1/teams?q=Natus')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by game', async () => {
      const res = await request(app)
        .get('/api/v1/teams?game=CS2')
        .expect(200);

      res.body.data.forEach(t => {
        expect(t.game.toLowerCase()).toBe('cs2');
      });
    });

    it('should filter by country', async () => {
      const res = await request(app)
        .get('/api/v1/teams?country=Ukraine')
        .expect(200);

      res.body.data.forEach(t => {
        expect(t.country.toLowerCase()).toBe('ukraine');
      });
    });

    it('should filter by isActive', async () => {
      const res = await request(app)
        .get('/api/v1/teams?isActive=true')
        .expect(200);

      res.body.data.forEach(t => {
        expect(t.isActive).toBe(true);
      });
    });

    it('should return 422 for invalid isActive value', async () => {
      const res = await request(app)
        .get('/api/v1/teams?isActive=invalid')
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/teams?limit=2&offset=0')
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.offset).toBe(0);
    });

    it('should support sorting by rating', async () => {
      const resDesc = await request(app)
        .get('/api/v1/teams?sortBy=rating&order=desc')
        .expect(200);

      if (resDesc.body.data.length > 1) {
        expect(resDesc.body.data[0].rating).toBeGreaterThanOrEqual(resDesc.body.data[1].rating);
      }
    });

    it('should support sorting by name (string field) in asc order', async () => {
      const resAsc = await request(app)
        .get('/api/v1/teams?sortBy=name&order=asc')
        .expect(200);

      if (resAsc.body.data.length > 1) {
        expect(resAsc.body.data[0].name.toLowerCase() <= resAsc.body.data[1].name.toLowerCase()).toBe(true);
      }
    });

    it('should support sorting by foundedDate', async () => {
      const res = await request(app)
        .get('/api/v1/teams?sortBy=foundedDate&order=desc')
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/teams/:id', () => {
    it('should return a team by id', async () => {
      const res = await request(app)
        .get('/api/v1/teams/tm1')
        .expect(200);

      expect(res.body).toHaveProperty('id', 'tm1');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('tag');
      expect(res.body).toHaveProperty('country');
    });

    it('should return 404 for non-existent team', async () => {
      const res = await request(app)
        .get('/api/v1/teams/nonexistent')
        .expect(404);

      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('не найден');
    });
  });

  describe('POST /api/v1/teams', () => {
    const validTeam = {
      name: 'Test Team',
      tag: 'TEST',
      country: 'Belarus',
      game: 'CS2',
      rating: 1500,
      isActive: true
    };

    it('should create a new team', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send(validTeam)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(validTeam.name);
      expect(res.body.tag).toBe(validTeam.tag);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({ name: 'Test' })
        .expect(422);

      expect(res.body.status).toBe('fail');
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 422 for invalid tag format', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({
          ...validTeam,
          tag: 'invalid-tag!'
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for tag too short', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({
          ...validTeam,
          tag: 'A'
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for invalid logoUrl', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({
          ...validTeam,
          logoUrl: 'not-a-valid-url'
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for rating out of range', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({
          ...validTeam,
          rating: -100
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for invalid foundedDate format', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({
          ...validTeam,
          foundedDate: 'invalid-date'
        })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should create team with valid foundedDate', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .send({
          ...validTeam,
          foundedDate: '2020-01-15'
        })
        .expect(201);

      expect(res.body.foundedDate).toBe('2020-01-15');
    });
  });

  describe('PUT /api/v1/teams/:id', () => {
    const updateData = {
      name: 'Updated Team',
      tag: 'UPD',
      country: 'Poland',
      game: 'Valorant',
      rating: 2000,
      isActive: true
    };

    it('should fully update a team', async () => {
      const res = await request(app)
        .put('/api/v1/teams/tm1')
        .send(updateData)
        .expect(200);

      expect(res.body.name).toBe(updateData.name);
      expect(res.body.tag).toBe(updateData.tag);
      expect(res.body.id).toBe('tm1');
    });

    it('should return 404 for non-existent team', async () => {
      const res = await request(app)
        .put('/api/v1/teams/nonexistent')
        .send(updateData)
        .expect(404);

      expect(res.body.status).toBe('fail');
    });
  });

  describe('PATCH /api/v1/teams/:id', () => {
    it('should partially update a team', async () => {
      const res = await request(app)
        .patch('/api/v1/teams/tm1')
        .send({ rating: 3000 })
        .expect(200);

      expect(res.body.rating).toBe(3000);
      expect(res.body.id).toBe('tm1');
    });

    it('should return 422 for empty update', async () => {
      const res = await request(app)
        .patch('/api/v1/teams/tm1')
        .send({})
        .expect(422);

      expect(res.body.status).toBe('fail');
    });

    it('should return 404 for non-existent team', async () => {
      const res = await request(app)
        .patch('/api/v1/teams/nonexistent')
        .send({ rating: 3000 })
        .expect(404);

      expect(res.body.status).toBe('fail');
    });

    it('should return 422 for invalid foundedDate in PATCH', async () => {
      const res = await request(app)
        .patch('/api/v1/teams/tm1')
        .send({ foundedDate: 'not-a-date' })
        .expect(422);

      expect(res.body.status).toBe('fail');
    });
  });

  describe('DELETE /api/v1/teams/:id', () => {
    it('should delete a team', async () => {
      await request(app)
        .delete('/api/v1/teams/tm1')
        .expect(204);

      // Verify deletion
      await request(app)
        .get('/api/v1/teams/tm1')
        .expect(404);
    });

    it('should return 404 for non-existent team', async () => {
      const res = await request(app)
        .delete('/api/v1/teams/nonexistent')
        .expect(404);

      expect(res.body.status).toBe('fail');
    });
  });
});

describe('Error handling', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app)
      .get('/api/v1/unknown')
      .expect(404);

    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('не найден');
  });

  it('should return 400 for invalid JSON', async () => {
    const res = await request(app)
      .post('/api/v1/teams')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }')
      .expect(400);

    expect(res.body.status).toBe('fail');
  });
});

describe('Root endpoint', () => {
  it('should return API info', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('documentation');
    expect(res.body).toHaveProperty('endpoints');
  });
});

describe('OpenAPI endpoint', () => {
  it('should return OpenAPI specification', async () => {
    const res = await request(app)
      .get('/api/openapi.json')
      .expect(200);

    expect(res.body).toHaveProperty('openapi');
    expect(res.body).toHaveProperty('info');
    expect(res.body).toHaveProperty('paths');
  });
});

describe('Error classes', () => {
  const {
    ApiError,
    BadRequestError,
    NotFoundError,
    ValidationError,
    InternalServerError,
    ConflictError
  } = require('../middleware/errors');

  it('ApiError should have correct properties', () => {
    const error = new ApiError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('ApiError should have status "error" for 5xx codes', () => {
    const error = new ApiError('Server error', 500);
    expect(error.status).toBe('error');
  });

  it('BadRequestError should have statusCode 400', () => {
    const error = new BadRequestError('Bad request');
    expect(error.statusCode).toBe(400);
  });

  it('NotFoundError should have statusCode 404', () => {
    const error = new NotFoundError('Not found');
    expect(error.statusCode).toBe(404);
  });

  it('ValidationError should have statusCode 422 and errors array', () => {
    const errors = [{ field: 'name', message: 'Required' }];
    const error = new ValidationError('Validation failed', errors);
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual(errors);
  });

  it('InternalServerError should have statusCode 500', () => {
    const error = new InternalServerError('Server error');
    expect(error.statusCode).toBe(500);
  });

  it('ConflictError should have statusCode 409', () => {
    const error = new ConflictError('Conflict');
    expect(error.statusCode).toBe(409);
  });
});
