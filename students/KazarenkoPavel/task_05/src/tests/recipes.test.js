const request = require('supertest');
const app = require('../src/app');
const storage = require('../src/utils/data');

describe('🍳 Recipes API', () => {
  // Сброс данных перед каждым тестом
  beforeEach(() => {
    // Можно очистить или переинициализировать storage
    storage.recipes.clear();
    storage.categories.clear();
    storage.initializeSampleData();
  });

  describe('GET /api/v1/recipes', () => {
    it('should return list of recipes with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/recipes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page', 1);
    });

    it('should filter recipes by category', async () => {
      const response = await request(app)
        .get('/api/v1/recipes?category=cat1')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Все рецепты должны быть в категории cat1
      response.body.data.forEach(recipe => {
        expect(recipe.category).toBe('cat1');
      });
    });

    it('should search recipes', async () => {
      const response = await request(app)
        .get('/api/v1/recipes/search?q=спагетти')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/recipes/:id', () => {
    it('should return recipe by id', async () => {
      const recipeId = 'rec1'; // Из sample данных

      const response = await request(app)
        .get(`/api/v1/recipes/${recipeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', recipeId);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .get('/api/v1/recipes/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('POST /api/v1/recipes', () => {
    it('should create new recipe', async () => {
      const newRecipe = {
        title: 'Тестовый рецепт',
        description: 'Описание тестового рецепта',
        category: 'cat1',
        difficulty: 'легко',
        time: 30,
        servings: 2,
        ingredients: [
          { name: 'Тестовый ингредиент', amount: '100 г' },
        ],
        steps: ['Шаг 1', 'Шаг 2'],
        tags: ['тест', 'быстро'],
      };

      const response = await request(app)
        .post('/api/v1/recipes')
        .send(newRecipe)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Рецепт успешно создан');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(newRecipe.title);
    });

    it('should return validation error for invalid data', async () => {
      const invalidRecipe = {
        title: '', // Пустое название
        description: 'Описание',
      };

      const response = await request(app)
        .post('/api/v1/recipes')
        .send(invalidRecipe)
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should return conflict error for duplicate title', async () => {
      const duplicateRecipe = {
        title: 'Спагетти Карбонара', // Уже существует в sample данных
        description: 'Описание',
        category: 'cat1',
        ingredients: [{ name: 'Ингредиент', amount: '100 г' }],
        steps: ['Шаг 1'],
      };

      const response = await request(app)
        .post('/api/v1/recipes')
        .send(duplicateRecipe)
        .expect(409);

      expect(response.body.error).toBe('Conflict');
    });
  });

  describe('PUT /api/v1/recipes/:id', () => {
    it('should update existing recipe', async () => {
      const recipeId = 'rec1';
      const updateData = {
        title: 'Обновленный рецепт',
        description: 'Обновленное описание',
      };

      const response = await request(app)
        .put(`/api/v1/recipes/${recipeId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Рецепт успешно обновлен');
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .put('/api/v1/recipes/nonexistent')
        .send({ title: 'Новый заголовок' })
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('DELETE /api/v1/recipes/:id', () => {
    it('should delete existing recipe', async () => {
      const recipeId = 'rec1';

      const response = await request(app)
        .delete(`/api/v1/recipes/${recipeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('успешно удален');
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .delete('/api/v1/recipes/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('GET /api/v1/recipes/stats', () => {
    it('should return recipes statistics', async () => {
      const response = await request(app)
        .get('/api/v1/recipes/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRecipes');
      expect(response.body.data).toHaveProperty('totalCategories');
      expect(response.body.data).toHaveProperty('recipesByDifficulty');
    });
  });
});
