const request = require('supertest');
const app = require('../src/app');
const storage = require('../src/utils/data');

describe('📂 Categories API', () => {
  beforeEach(() => {
    storage.recipes.clear();
    storage.categories.clear();
    storage.initializeSampleData();
  });

  describe('GET /api/v1/categories', () => {
    it('should return list of categories', async () => {
      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create new category', async () => {
      const newCategory = {
        name: 'Новая категория',
        description: 'Описание новой категории',
        color: '#FF0000',
      };

      const response = await request(app)
        .post('/api/v1/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newCategory.name);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should return conflict when category has recipes', async () => {
      const categoryId = 'cat1'; // В этой категории есть рецепты

      const response = await request(app)
        .delete(`/api/v1/categories/${categoryId}`)
        .expect(409);

      expect(response.body.error).toBe('Conflict');
    });
  });
});
