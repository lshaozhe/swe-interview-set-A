// INTERVIEWER-ANNOTATION-START
// [DSO-07 · T2 · security] Tests import the production config module directly; there is no separate test configuration, so a test run could touch production resources if wired to them.
//     Look near: import config from '../../src/server/config'
// INTERVIEWER-ANNOTATION-END
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import config from '../../src/server/config'
import { app, auth, freshDb, login } from './helpers'

beforeEach(async () => {
  await freshDb()
})

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@acme.com', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user).toMatchObject({ email: 'alice@acme.com', role: 'admin' })
  })

  it('returns 401 for a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@acme.com', password: 'wrong' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for an unknown user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@acme.com', password: 'password123' })
    expect(res.status).toBe(401)
  })
})

describe('authenticated routes', () => {
  it('rejects a missing token', async () => {
    const res = await request(app).get('/api/users/1')
    expect(res.status).toBe(401)
  })

  it('accepts a token signed with the configured secret', async () => {
    const token = jwt.sign({ id: 1, email: 'alice@acme.com', role: 'admin', orgId: 1 }, config.jwt.secret)
    const res = await request(app).get('/api/users/2').set(auth(token))
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('bob@acme.com')
  })

  it('returns 404 for an unknown user', async () => {
    const token = await login()
    const res = await request(app).get('/api/users/999').set(auth(token))
    expect(res.status).toBe(404)
  })
})
