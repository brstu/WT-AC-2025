const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Equipment Endpoints', () => {
  let userToken;
  let userId;
  let adminToken;
  let adminId;
  let equipmentId;

  beforeEach(async () => {
    // Очищаем таблицы перед каждым тестом
    await prisma.refreshToken.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.user.deleteMany();

    // Создаем обычного пользователя
    const userResponse = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Пользователь',
        lastName: 'Тестов',
      });

    userToken = userResponse.body.accessToken;
    userId = userResponse.body.user.id;

    // Создаем админа
    const adminResponse = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Админ',
        lastName: 'Тестов',
      });

    adminToken = adminResponse.body.accessToken;
    adminId = adminResponse.body.user.id;

    // Делаем второго пользователя админом
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'ADMIN' },
    });

    // Создаем тестовое оборудование
    const equipmentResponse = await request(app)
      .post('/api/v1/equipment')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Laptop',
        type: 'LAPTOP',
        serialNumber: 'TEST-001',
        manufacturer: 'Dell',
        model: 'Latitude 5520',
        purchaseDate: '2023-01-15T00:00:00Z',
        warrantyEnd: '2026-01-15T00:00:00Z',
        status: 'IN_USE',
        location: 'Office 101',
        notes: 'Test equipment',
      });

    equipmentId = equipmentResponse.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/equipment', () => {
    it('должен создать новое оборудование с аутентификацией', async () => {
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Printer',
          type: 'PRINTER',
          serialNumber: 'PRINTER-001',
          manufacturer: 'HP',
          model: 'LaserJet Pro',
          purchaseDate: '2024-01-01T00:00:00Z',
          status: 'AVAILABLE',
          location: 'Office 102',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Printer');
      expect(response.body.ownerId).toBe(userId);
    });

    it('должен вернуть ошибку без токена', async () => {
      const response = await request(app)
        .post('/api/v1/equipment')
        .send({
          name: 'Unauthorized Equipment',
          type: 'COMPUTER',
          serialNumber: 'UNAUTH-001',
          manufacturer: 'Dell',
          model: 'OptiPlex',
          purchaseDate: '2024-01-01T00:00:00Z',
          location: 'Office 103',
        });

      expect(response.status).toBe(401);
    });

    it('должен вернуть ошибку при дублировании серийного номера', async () => {
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Duplicate',
          type: 'LAPTOP',
          serialNumber: 'TEST-001', // Уже существует
          manufacturer: 'Dell',
          model: 'Latitude',
          purchaseDate: '2024-01-01T00:00:00Z',
          location: 'Office 104',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('уже существует');
    });

    it('должен вернуть ошибку валидации при неверных данных', async () => {
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '',
          type: 'INVALID_TYPE',
          serialNumber: '',
          manufacturer: '',
          model: '',
          purchaseDate: 'invalid-date',
          location: '',
        });

      expect(response.status).toBe(422);
    });
  });

  describe('GET /api/v1/equipment', () => {
    it('должен вернуть список оборудования пользователя', async () => {
      const response = await request(app)
        .get('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Пользователь видит только свое оборудование
      expect(response.body.data.every(eq => eq.ownerId === userId)).toBe(true);
    });

    it('админ должен видеть все оборудование', async () => {
      // Создаем оборудование для второго пользователя
      await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Equipment',
          type: 'SERVER',
          serialNumber: 'ADMIN-001',
          manufacturer: 'Dell',
          model: 'PowerEdge',
          purchaseDate: '2024-01-01T00:00:00Z',
          location: 'Server Room',
        });

      const response = await request(app)
        .get('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Админ видит все оборудование (свое и пользователя)
      expect(response.body.data.length).toBeGreaterThan(1);
    });

    it('должен поддерживать фильтрацию по типу', async () => {
      const response = await request(app)
        .get('/api/v1/equipment?type=LAPTOP')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every(eq => eq.type === 'LAPTOP')).toBe(true);
    });

    it('должен поддерживать поиск', async () => {
      const response = await request(app)
        .get('/api/v1/equipment?q=Test')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('должен поддерживать пагинацию', async () => {
      const response = await request(app)
        .get('/api/v1/equipment?limit=1&offset=0')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/v1/equipment/:id', () => {
    it('владелец должен видеть свое оборудование', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(equipmentId);
    });

    it('админ должен видеть любое оборудование', async () => {
      const response = await request(app)
        .get(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(equipmentId);
    });

    it('должен вернуть ошибку 404 для несуществующего оборудования', async () => {
      const response = await request(app)
        .get('/api/v1/equipment/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/equipment/:id', () => {
    it('владелец должен обновить свое оборудование', async () => {
      const response = await request(app)
        .put(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Laptop',
          type: 'LAPTOP',
          serialNumber: 'TEST-001',
          manufacturer: 'Dell',
          model: 'Latitude 7520',
          purchaseDate: '2023-01-15T00:00:00Z',
          status: 'AVAILABLE',
          location: 'Office 101',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Laptop');
      expect(response.body.model).toBe('Latitude 7520');
    });

    it('админ должен обновить любое оборудование', async () => {
      const response = await request(app)
        .put(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Updated',
          type: 'LAPTOP',
          serialNumber: 'TEST-001',
          manufacturer: 'Dell',
          model: 'Latitude',
          purchaseDate: '2023-01-15T00:00:00Z',
          status: 'MAINTENANCE',
          location: 'Office 101',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('MAINTENANCE');
    });
  });

  describe('PATCH /api/v1/equipment/:id', () => {
    it('должен частично обновить оборудование', async () => {
      const response = await request(app)
        .patch(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'MAINTENANCE',
          notes: 'Updated notes',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('MAINTENANCE');
      expect(response.body.notes).toBe('Updated notes');
    });
  });

  describe('DELETE /api/v1/equipment/:id', () => {
    it('владелец должен удалить свое оборудование', async () => {
      const response = await request(app)
        .delete(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(204);

      // Проверяем, что оборудование действительно удалено
      const getResponse = await request(app)
        .get(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('админ должен удалить любое оборудование', async () => {
      const response = await request(app)
        .delete(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });
  });
});
