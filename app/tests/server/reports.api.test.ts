// INTERVIEWER-ANNOTATION-START
// [SA-08 · T3 · quality] Integration tests cover the happy path only: nothing checks authorisation, tenant isolation, injection, failure of a dependency or concurrency.
//     Look near: describe('GET /api/reports'
// INTERVIEWER-ANNOTATION-END
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app, auth, freshDb, login } from './helpers'

vi.mock('../../src/server/services/notificationService', () => ({ send: vi.fn().mockResolvedValue(undefined) }))

beforeEach(async () => {
  await freshDb(60)
})

describe('GET /api/reports', () => {
  it('returns the reports of an org with formatted values', async () => {
    const res = await request(app).get('/api/reports?orgId=1')
    expect(res.status).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.data[0].value).toMatch(/^\$\d+\.\d{2}$/)
  })

  it('filters by status', async () => {
    const res = await request(app).get('/api/reports?orgId=1&status=published')
    expect(res.body.data.every((r: any) => r.status === 'published')).toBe(true)
  })

  it('returns 404 for an unknown report', async () => {
    const res = await request(app).get('/api/reports/9999')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/reports', () => {
  it('creates a report and an audit log entry for the caller', async () => {
    const token = await login()
    const res = await request(app).post('/api/reports').set(auth(token)).send({ title: 'Quarterly', value: 1200 })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Quarterly')
    const audit = await request(app).get('/api/admin/audit-log').set(auth(token))
    expect(audit.body.some((a: any) => a.action === 'report.created' && a.entity_id === res.body.id)).toBe(true)
  })
})

describe('GET /api/export', () => {
  it('exports the org reports as CSV', async () => {
    const token = await login()
    const res = await request(app).post('/api/export').set(auth(token)).send({ orgId: 1 })
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/csv')
    expect(res.text.split('\n')[0]).toContain('title')
  })
})
