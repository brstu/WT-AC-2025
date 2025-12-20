const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const app = require('../app');
const { generateAccessToken } = require('../utils/jwt');

const prisma = new PrismaClient();

describe('Tasks API', () => {
  let accessToken;
  let userId;
  let taskId;
  let otherUserToken;

  beforeAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['tasktest@example.com', 'otheruser@example.com'],
        },
      },
    });

    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        email: 'tasktest@example.com',
        password: hashedPassword,
        name: 'Task Test User',
        role: 'USER',
      },
    });

    userId = user.id;
    accessToken = generateAccessToken(user);

    const otherUser = await prisma.user.create({
      data: {
        email: 'otheruser@example.com',
        password: hashedPassword,
        name: 'Other User',
        role: 'USER',
      },
    });

    otherUserToken = generateAccessToken(otherUser);
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['tasktest@example.com', 'otheruser@example.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/tasks', () => {
    it('should create task', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Finish coursework',
          description: 'Backend lab',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Finish coursework');
      expect(res.body.data.task.completed).toBe(false);
      expect(res.body.data.task.ownerId).toBe(userId);

      taskId = res.body.data.task.id;
    });

    it('should fail without auth', async () => {
      await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'No auth' })
        .expect(401);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should get user tasks', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should get task by id', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.task.id).toBe(taskId);
    });

    it('should forbid other user', async () => {
      await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    it('should update task', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ completed: true })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.task.completed).toBe(true);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should return 404 after delete', async () => {
      await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
