const request = require('supertest')
const { app } = require('../src/app')

async function signupAndGetToken(email) {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email, password: 'qwerty123' })

  return res.body.token
}

describe('Podcasts owner access', () => {
  it('user cannot access чужой подкаст', async () => {
    const tokenA = await signupAndGetToken(`a_${Date.now()}@f1.com`)
    const tokenB = await signupAndGetToken(`b_${Date.now()}@f1.com`)

    const created = await request(app)
      .post('/api/podcasts')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'F1 A Podcast', description: 'A desc' })

    expect(created.status).toBe(201)
    const podcastId = created.body.data.id

    const readB = await request(app)
      .get(`/api/podcasts/${podcastId}`)
      .set('Authorization', `Bearer ${tokenB}`)

    expect(readB.status).toBe(404)
  })
})