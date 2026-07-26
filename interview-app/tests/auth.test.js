const request = require('supertest')
const app = require('../server/index')
const config = require('../server/config')

// [DSO-T2] This test file imports config.js directly, which means tests run
//          using the PRODUCTION database credentials. Any data mutations in
//          tests (inserts, deletes) affect real production data.
//          Test environments should use a separate config or environment variables
//          that point to a test/staging database.

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

  // No test for: brute force protection, account lockout, rate limiting
  // No test for: expired token rejection (would catch the jwt.decode() bug)
  // No test for: token payload structure validation
})

describe('GET /api/reports', () => {
  it('returns reports for authenticated user', async () => {
    // Uses a real token generated against production DB
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@acme.com', password: 'correctpassword' })

    const res = await request(app)
      .get('/api/reports?orgId=1')
      .set('Authorization', `Bearer ${loginRes.body.token}`)

    expect(res.status).toBe(200)
    // No test verifying that org 1 results don't include org 2 data (tenant isolation)
  })
})
