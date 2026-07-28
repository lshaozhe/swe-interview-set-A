const request = require('supertest')
const app = require('../server/index')
const config = require('../server/config')

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@acme.com', password: 'correctpassword' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('returns 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@acme.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/reports', () => {
  it('returns reports for authenticated user', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@acme.com', password: 'correctpassword' })

    const res = await request(app)
      .get('/api/reports?orgId=1')
      .set('Authorization', `Bearer ${loginRes.body.token}`)

    expect(res.status).toBe(200)
  })
})
