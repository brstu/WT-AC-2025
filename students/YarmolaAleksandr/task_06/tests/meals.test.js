const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { generateAccessToken } = require('../src/utils/jwt');

const prisma = new PrismaClient();

describe('Meals API', () => {
  let accessToken;
  let userId;
  let mealId;
  let otherUserToken;
  let otherUserId;

  beforeAll(async () => {
    // Clean up test data
    await prisma.meal.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['mealtest@example.com', 'otheruser@example.com'],
        },
      },
    });

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'mealtest@example.com',
        password: hashedPassword,
        name: 'Meal Test User',
        role: 'USER',
      },
    });

    userId = user.id;
    accessToken = generateAccessToken(user);

    // Create another user for ownership tests
    const otherUser = await prisma.user.create({
      data: {
        email: 'otheruser@example.com',
        password: hashedPassword,
        name: 'Other User',
        role: 'USER',
      },
    });

    otherUserId = otherUser.id;
    otherUserToken = generateAccessToken(otherUser);
  });

  afterAll(async () => {
    await prisma.meal.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['mealtest@example.com', 'otheruser@example.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/meals', () => {
    it('should create a new meal successfully', async () => {
      const res = await request(app)
        .post('/api/v1/meals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Oatmeal Breakfast',
          description: 'Healthy breakfast with fruits',
          mealType: 'BREAKFAST',
          date: '2024-01-15T08:00:00.000Z',
          calories: 350,
          protein: 12,
          carbs: 58,
          fat: 8,
          notes: 'Added blueberries',
          isPrivate: false,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.meal).toHaveProperty('id');
      expect(res.body.data.meal.name).toBe('Oatmeal Breakfast');
      expect(res.body.data.meal.calories).toBe(350);
      expect(res.body.data.meal.mealType).toBe('BREAKFAST');
      expect(res.body.data.meal.userId).toBe(userId);

      mealId = res.body.data.meal.id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/meals')
        .send({
          name: 'Test Meal',
          mealType: 'LUNCH',
          date: '2024-01-15T12:00:00.000Z',
          calories: 500,
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid mealType', async () => {
      const res = await request(app)
        .post('/api/v1/meals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Meal',
          mealType: 'INVALID_TYPE',
          date: '2024-01-15T12:00:00.000Z',
          calories: 500,
        })
        .expect(422);

      expect(res.body.success).toBe(false);
    });

    it('should fail with calories out of range', async () => {
      const res = await request(app)
        .post('/api/v1/meals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Meal',
          mealType: 'LUNCH',
          date: '2024-01-15T12:00:00.000Z',
          calories: 15000, // Too high
        })
        .expect(422);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/meals', () => {
    beforeAll(async () => {
      // Create multiple meals for testing
      await prisma.meal.createMany({
        data: [
          {
            name: 'Lunch Salad',
            mealType: 'LUNCH',
            date: new Date('2024-01-15T12:00:00.000Z'),
            calories: 450,
            protein: 25,
            carbs: 40,
            fat: 15,
            userId,
          },
          {
            name: 'Dinner Steak',
            mealType: 'DINNER',
            date: new Date('2024-01-15T19:00:00.000Z'),
            calories: 700,
            protein: 45,
            carbs: 30,
            fat: 35,
            userId,
          },
          {
            name: 'Afternoon Snack',
            mealType: 'SNACK',
            date: new Date('2024-01-15T15:00:00.000Z'),
            calories: 200,
            protein: 5,
            carbs: 25,
            fat: 8,
            userId,
          },
        ],
      });
    });

    it('should get all user meals with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/meals?limit=10&page=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.meals).toBeInstanceOf(Array);
      expect(res.body.data.meals.length).toBeGreaterThan(0);
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('limit');
    });

    it('should filter meals by mealType', async () => {
      const res = await request(app)
        .get('/api/v1/meals?mealType=BREAKFAST')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.data.meals.forEach((meal) => {
        expect(meal.mealType).toBe('BREAKFAST');
      });
    });

    it('should filter meals by date range', async () => {
      const res = await request(app)
        .get('/api/v1/meals?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.meals).toBeInstanceOf(Array);
    });

    it('should sort meals by calories', async () => {
      const res = await request(app)
        .get('/api/v1/meals?sortBy=calories&sortOrder=desc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const calories = res.body.data.meals.map((m) => m.calories);
      const sortedCalories = [...calories].sort((a, b) => b - a);
      expect(calories).toEqual(sortedCalories);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/v1/meals').expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/meals/:id', () => {
    it('should get meal by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.meal.id).toBe(mealId);
      expect(res.body.data.meal.name).toBe('Oatmeal Breakfast');
    });

    it('should fail to get another user meal', async () => {
      const res = await request(app)
        .get(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent meal', async () => {
      const res = await request(app)
        .get('/api/v1/meals/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/meals/:id', () => {
    it('should update meal successfully', async () => {
      const res = await request(app)
        .patch(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          calories: 400,
          notes: 'Updated notes',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.meal.calories).toBe(400);
      expect(res.body.data.meal.notes).toBe('Updated notes');
    });

    it('should fail to update another user meal', async () => {
      const res = await request(app)
        .patch(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          calories: 500,
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .patch(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          calories: -100, // Invalid
        })
        .expect(422);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent meal', async () => {
      const res = await request(app)
        .patch('/api/v1/meals/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          calories: 400,
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/meals/:id', () => {
    it('should fail to delete another user meal', async () => {
      const res = await request(app)
        .delete(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should delete meal successfully', async () => {
      const res = await request(app)
        .delete(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app)
        .get(`/api/v1/meals/${mealId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent meal', async () => {
      const res = await request(app)
        .delete('/api/v1/meals/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
