const request = require('supertest')
const { app } = require('../src/app')

describe('Auth', () => {
  const email = `user_${Date.now()}@f1.com`
  const password = 'qwerty123'

  it('signup -> returns token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email, password })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(email)
  })

  it('login -> returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })
})