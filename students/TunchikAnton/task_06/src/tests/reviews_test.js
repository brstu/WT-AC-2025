const request = require('supertest');
const app = require('../src/server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_jwt_key_for_development';

describe('Отзывы API', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeEach(async () => {
    await testPrisma.refreshToken.deleteMany();
    await testPrisma.review.deleteMany();
    await testPrisma.user.deleteMany();

    const user = await createTestUser('user@example.com', 'user');
    const admin = await createTestUser('admin@example.com', 'admin', 'ADMIN');

    userId = user.id;
    adminId = admin.id;

    userToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  test('POST /api/reviews - создание отзыва', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        placeName: 'Тестовое место',
        description: 'Очень хорошее место для отдыха',
        rating: 4.5,
        location: 'ул. Тестовая, 1',
        tags: ['отдых', 'тест']
      })
      .expect(201);

    expect(response.body.placeName).toBe('Тестовое место');
    expect(response.body.description).toBe('Очень хорошее место для отдыха');
    expect(response.body.rating).toBe(4.5);
    expect(response.body.status).toBe('PENDING');
    expect(response.body.userId).toBe(userId);
  });

  test('POST /api/reviews - ошибка без аутентификации', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .send({
        placeName: 'Тестовое место',
        description: 'Описание',
        rating: 4.5
      })
      .expect(401);

    expect(response.body.error).toBe('Authorization token required');
  });

  test('POST /api/reviews - ошибка валидации', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        placeName: '', // пустое название
        description: 'Коротко',
        rating: 6 // слишком высокий рейтинг
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation error');
  });

  test('GET /api/reviews - получение списка отзывов', async () => {
    await createTestReview(userId, 'APPROVED');
    await createTestReview(userId, 'PENDING');

    const response = await request(app)
      .get('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('reviews');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.reviews).toHaveLength(2);
  });

  test('GET /api/reviews - фильтрация по статусу (для админа)', async () => {
    await createTestReview(userId, 'APPROVED');
    await createTestReview(userId, 'PENDING');

    const response = await request(app)
      .get('/api/reviews?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.reviews).toHaveLength(1);
    expect(response.body.reviews[0].status).toBe('PENDING');
  });

  test('GET /api/reviews - только свои отзывы', async () => {
    const otherUser = await createTestUser('other@example.com', 'otheruser');
    await createTestReview(userId, 'APPROVED');
    await createTestReview(otherUser.id, 'APPROVED');

    const response = await request(app)
      .get('/api/reviews?userOnly=true')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.reviews).toHaveLength(1);
    expect(response.body.reviews[0].userId).toBe(userId);
  });

  test('GET /api/reviews/:id - получение отзыва по ID', async () => {
    const review = await createTestReview(userId, 'APPROVED');

    const response = await request(app)
      .get(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.id).toBe(review.id);
    expect(response.body.placeName).toBe('Test Place');
  });

  test('GET /api/reviews/:id - доступ к чужому одобренному отзыву', async () => {
    const otherUser = await createTestUser('other@example.com', 'otheruser');
    const review = await createTestReview(otherUser.id, 'APPROVED');

    const response = await request(app)
      .get(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.id).toBe(review.id);
  });

  test('GET /api/reviews/:id - нет доступа к чужому pending отзыву', async () => {
    const otherUser = await createTestUser('other@example.com', 'otheruser');
    const review = await createTestReview(otherUser.id, 'PENDING');

    const response = await request(app)
      .get(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(response.body.error).toBe('Access denied');
  });

  test('PUT /api/reviews/:id - обновление своего отзыва', async () => {
    const review = await createTestReview(userId, 'PENDING');

    const response = await request(app)
      .put(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        placeName: 'Обновленное название',
        rating: 5.0
      })
      .expect(200);

    expect(response.body.placeName).toBe('Обновленное название');
    expect(response.body.rating).toBe(5.0);
  });

  test('PUT /api/reviews/:id - нельзя редактировать одобренный отзыв', async () => {
    const review = await createTestReview(userId, 'APPROVED');

    const response = await request(app)
      .put(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        placeName: 'Новое название'
      })
      .expect(400);

    expect(response.body.error).toBe('Cannot edit approved review');
  });

  test('DELETE /api/reviews/:id - удаление своего отзыва', async () => {
    const review = await createTestReview(userId, 'PENDING');

    await request(app)
      .delete(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);

    const deletedReview = await testPrisma.review.findUnique({
      where: { id: review.id }
    });
    expect(deletedReview).toBeNull();
  });

  test('DELETE /api/reviews/:id - нельзя удалить чужой отзыв', async () => {
    const otherUser = await createTestUser('other@example.com', 'otheruser');
    const review = await createTestReview(otherUser.id, 'PENDING');

    const response = await request(app)
      .delete(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(response.body.error).toBe('Access denied');
  });
});