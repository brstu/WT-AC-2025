const request = require('supertest');
const app = require('../index');

describe('Event API', () => {
  test('GET /api/events should return all events', async () => {
    const response = await request(app).get('/api/events');
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('POST /api/events should create a new event', async () => {
    const newEvent = {
      title: 'Integration Test Event',
      date: '2024-12-25',
      time: '20:00',
      location: 'Test Location',
      description: 'Test Description',
      attendees: 50
    };

    const response = await request(app)
      .post('/api/events')
      .send(newEvent);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(newEvent.title);
  });

  test('GET /api/events/:id should return specific event', async () => {
    const response = await request(app).get('/api/events/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', '1');
  });

  test('DELETE /api/events/:id should delete event', async () => {
    const response = await request(app).delete('/api/events/1');
    
    expect(response.status).toBe(204);
  });
});