const request = require('supertest');
const app = require('../src/app');

describe('Gadgets API', () => {
  const testGadget = {
    name: 'Test iPhone',
    brand: 'Apple',
    category: 'smartphone',
    price: 999.99,
    rating: 4.5,
    description: 'Test smartphone for API testing',
    releaseDate: '2023-09-15',
    inStock: true
  };

  let createdGadgetId;

  describe('POST /api/v1/gadgets', () => {
    test('should create a new gadget with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(testGadget)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(testGadget.name);
      expect(response.body.data.brand).toBe(testGadget.brand);
      expect(response.body.data.category).toBe(testGadget.category);
      expect(response.body.data.price).toBe(testGadget.price);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');

      createdGadgetId = response.body.data.id;
    });

    test('should return 422 for invalid data', async () => {
      const invalidGadget = {
        name: '', // Empty name
        brand: 'Apple',
        category: 'invalid_category',
        price: -100 // Negative price
      };

      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(invalidGadget)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    test('should return 422 for missing required fields', async () => {
      const incompleteGadget = {
        name: 'Test Gadget'
        // Missing required fields: brand, category, price
      };

      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(incompleteGadget)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details).toBeInstanceOf(Array);

      const missingFields = response.body.details.map(d => d.field);
      expect(missingFields).toContain('brand');
      expect(missingFields).toContain('category');
      expect(missingFields).toContain('price');
    });
  });

  describe('GET /api/v1/gadgets', () => {
    beforeEach(async () => {
      // Create test gadget for GET tests
      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(testGadget);
      
      createdGadgetId = response.body.data.id;
    });

    test('should get all gadgets with default pagination', async () => {
      const response = await request(app)
        .get('/api/v1/gadgets')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('offset');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('pages');
    });

    test('should filter gadgets by category', async () => {
      const response = await request(app)
        .get('/api/v1/gadgets?category=smartphone')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      if (response.body.data.length > 0) {
        response.body.data.forEach(gadget => {
          expect(gadget.category).toBe('smartphone');
        });
      }
    });

    test('should search gadgets by query', async () => {
      const response = await request(app)
        .get('/api/v1/gadgets?q=Test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('should support pagination with page parameter', async () => {
      const response = await request(app)
        .get('/api/v1/gadgets?page=1&limit=5')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta.page).toBe(1);
    });

    test('should support sorting by price', async () => {
      const response = await request(app)
        .get('/api/v1/gadgets?sortBy=price&sortOrder=desc')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/gadgets/:id', () => {
    beforeEach(async () => {
      // Create test gadget
      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(testGadget);
      
      createdGadgetId = response.body.data.id;
    });

    test('should get gadget by valid ID', async () => {
      const response = await request(app)
        .get(`/api/v1/gadgets/${createdGadgetId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdGadgetId);
      expect(response.body.data.name).toBe(testGadget.name);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .get(`/api/v1/gadgets/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Gadget not found');
    });

    test('should return 422 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/gadgets/invalid-id')
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('PATCH /api/v1/gadgets/:id', () => {
    beforeEach(async () => {
      // Create test gadget
      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(testGadget);
      
      createdGadgetId = response.body.data.id;
    });

    test('should update gadget with valid data', async () => {
      const updateData = {
        name: 'Updated iPhone',
        price: 1199.99
      };

      const response = await request(app)
        .patch(`/api/v1/gadgets/${createdGadgetId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.brand).toBe(testGadget.brand); // Unchanged
      expect(response.body.data.updatedAt).toBeDefined();
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .patch(`/api/v1/gadgets/${nonExistentId}`)
        .send({ name: 'Updated Name' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Gadget not found');
    });

    test('should return 422 for invalid update data', async () => {
      const invalidUpdate = {
        price: -500,
        rating: 10
      };

      const response = await request(app)
        .patch(`/api/v1/gadgets/${createdGadgetId}`)
        .send(invalidUpdate)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('PUT /api/v1/gadgets/:id', () => {
    beforeEach(async () => {
      // Create test gadget
      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(testGadget);
      
      createdGadgetId = response.body.data.id;
    });

    test('should replace gadget with valid data', async () => {
      const replaceData = {
        name: 'Completely New Gadget',
        brand: 'Samsung',
        category: 'tablet',
        price: 799.99,
        rating: 4.0,
        description: 'A completely new tablet'
      };

      const response = await request(app)
        .put(`/api/v1/gadgets/${createdGadgetId}`)
        .send(replaceData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(replaceData.name);
      expect(response.body.data.brand).toBe(replaceData.brand);
      expect(response.body.data.category).toBe(replaceData.category);
      expect(response.body.data.price).toBe(replaceData.price);
    });

    test('should return 422 for missing required fields in PUT', async () => {
      const incompleteData = {
        name: 'New Name'
        // Missing required fields
      };

      const response = await request(app)
        .put(`/api/v1/gadgets/${createdGadgetId}`)
        .send(incompleteData)
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('DELETE /api/v1/gadgets/:id', () => {
    beforeEach(async () => {
      // Create test gadget
      const response = await request(app)
        .post('/api/v1/gadgets')
        .send(testGadget);
      
      createdGadgetId = response.body.data.id;
    });

    test('should delete gadget by valid ID', async () => {
      const response = await request(app)
        .delete(`/api/v1/gadgets/${createdGadgetId}`)
        .expect(204);

      expect(response.body).toEqual({});

      // Verify gadget is deleted
      await request(app)
        .get(`/api/v1/gadgets/${createdGadgetId}`)
        .expect(404);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .delete(`/api/v1/gadgets/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Gadget not found');
    });
  });

  describe('GET /api/v1/gadgets/stats', () => {
    beforeEach(async () => {
      // Create test gadgets for stats
      const gadgets = [
        { ...testGadget, name: 'iPhone 1' },
        { ...testGadget, name: 'iPhone 2', category: 'laptop' },
        { ...testGadget, name: 'iPhone 3', inStock: false }
      ];

      for (const gadget of gadgets) {
        await request(app)
          .post('/api/v1/gadgets')
          .send(gadget);
      }
    });

    test('should get gadgets statistics', async () => {
      const response = await request(app)
        .get('/api/v1/gadgets/stats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('inStock');
      expect(response.body.data).toHaveProperty('outOfStock');
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('brands');
      expect(response.body.data).toHaveProperty('averagePrice');
      expect(response.body.data).toHaveProperty('averageRating');
    });
  });

  describe('API Error Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/gadgets')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
    });
  });
});