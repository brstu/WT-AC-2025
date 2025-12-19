const request = require('supertest');
const app = require('../src/server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_jwt_key_for_development';

describe('Админ API', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;

  beforeEach(async () => {
    await testPrisma.refreshToken.deleteMany();
    await testPrisma.review.deleteMany();
    await testPrisma.user.deleteMany();

    const admin = await createTestUser('admin@example.com', 'admin', 'ADMIN');
    const user = await createTestUser('user@example.com', 'user', 'USER');

    adminId = admin.id;
    userId = user.id;

    adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  test('PATCH /api/reviews/:id/moderate - одобрение отзыва админом', async () => {
    const review = await createTestReview(userId, 'PENDING');

    const response = await request(app)
      .patch(`/api/reviews/${review.id}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'APPROVED'
      })
      .expect(200);

    expect(response.body.status).toBe('APPROVED');
    expect(response.body.moderatedBy).toBe(adminId);
    expect(response.body.moderatedAt).toBeDefined();
  });

  test('PATCH /api/reviews/:id/moderate - отклонение отзыва с причиной', async () => {
    const review = await createTestReview(userId, 'PENDING');

    const response = await request(app)
      .patch(`/api/reviews/${review.id}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'REJECTED',
        rejectionReason: 'Нарушение правил сообщества'
      })
      .expect(200);

    expect(response.body.status).toBe('REJECTED');
    expect(response.body.rejectionReason).toBe('Нарушение правил сообщества');
  });

  test('PATCH /api/reviews/:id/moderate - ошибка для не-админа', async () => {
    const review = await createTestReview(userId, 'PENDING');

    const response = await request(app)
      .patch(`/api/reviews/${review.id}/moderate`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'APPROVED'
      })
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });

  test('GET /api/admin/stats - получение статистики', async () => {
    await createTestReview(userId, 'PENDING');
    await createTestReview(userId, 'APPROVED');
    await createTestReview(userId, 'REJECTED');

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.reviews.total).toBe(3);
    expect(response.body.reviews.pending).toBe(1);
    expect(response.body.reviews.approved).toBe(1);
    expect(response.body.reviews.rejected).toBe(1);
    expect(response.body.users).toBe(2); // admin + user
  });

  test('GET /api/admin/stats - ошибка для не-админа', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });
});