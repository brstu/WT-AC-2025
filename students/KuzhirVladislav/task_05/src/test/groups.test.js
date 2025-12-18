const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const dataService = require('../services/dataService');
const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, '../data.json');

describe('Groups API', () => {
  beforeEach(async () => {
    await fs.writeJson(dataPath, {
      groups: {},
      tasks: {},
      grades: {},
    });
    await dataService.initData();
  });

  it('should create a new group', async () => {
    const res = await request(app)
      .post('/api/groups')
      .send({
        name: 'Test Group',
        description: 'Test desc',
        students: ['student1'],
      });
    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body && res.body.data && res.body.data.id);
  });

  it('should get all groups', async () => {
    await request(app)
      .post('/api/groups')
      .send({
        name: 'Test Group',
        description: 'Test desc',
        students: ['student1'],
      });

    const res = await request(app).get('/api/groups');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body && res.body.data && res.body.data.length, 1);
  });

  it('should get a group by id', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .send({
        name: 'Test Group',
        description: 'Test desc',
        students: ['student1'],
      });
    const id = createRes.body.data.id;

    const res = await request(app).get(`/api/groups/${id}`);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body && res.body.data && res.body.data.name, 'Test Group');
  });

  it('should update a group', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .send({
        name: 'Test Group',
        description: 'Test desc',
        students: ['student1'],
      });
    const id = createRes.body.data.id;

    const res = await request(app).patch(`/api/groups/${id}`).send({ name: 'Updated Group' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body && res.body.data && res.body.data.name, 'Updated Group');
  });

  it('should delete a group', async () => {
    const createRes = await request(app)
      .post('/api/groups')
      .send({
        name: 'Test Group',
        description: 'Test desc',
        students: ['student1'],
      });
    const id = createRes.body.data.id;

    const res = await request(app).delete(`/api/groups/${id}`);
    assert.strictEqual(res.statusCode, 204);

    const getRes = await request(app).get(`/api/groups/${id}`);
    assert.strictEqual(getRes.statusCode, 404);
  });

  it('should return 422 on validation error', async () => {
    const res = await request(app).post('/api/groups').send({ name: '' });
    assert.strictEqual(res.statusCode, 422);
  });
});
