import axios from 'axios'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCache, getReport } from '../../app/src/server/cache/redis'
import { pg, query } from '../../app/src/server/db/queries'
import { createReport, getReportsWithAuthors } from '../../app/src/server/services/reportService'
import { app, auth, freshDb, login } from '../../app/tests/server/helpers'

beforeEach(async () => {
  vi.restoreAllMocks()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await freshDb(60)
})

describe('proofs: TeamMetrics', () => {
  it('BE-03 reports are readable without a token, for any org', async () => {
    const res = await request(app).get('/api/reports?orgId=2')
    expect(res.status).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
  })

  it('BE-04 no rate limit is applied', async () => {
    const statuses = new Set<number>()
    for (let i = 0; i < 150; i++) statuses.add((await request(app).get('/api/reports?orgId=1')).status)
    expect([...statuses]).toEqual([200])
  })

  it('BE-05 a token signed with the wrong secret, or an expired one, is accepted', async () => {
    const forged = jwt.sign({ id: 1, email: 'alice@acme.com', role: 'admin', orgId: 1 }, 'not-the-secret')
    const expired = jwt.sign({ id: 1, email: 'alice@acme.com', role: 'admin', orgId: 1, exp: Math.floor(Date.now() / 1000) - 3600 }, 'x')
    expect((await request(app).get('/api/users/1').set(auth(forged))).status).toBe(200)
    expect((await request(app).get('/api/users/1').set(auth(expired))).status).toBe(200)
  })

  it('BE-11 a member can read and edit another user, and gets the password hash', async () => {
    const bob = await login('bob@acme.com')
    const read = await request(app).get('/api/users/1').set(auth(bob))
    expect(read.status).toBe(200)
    expect(read.body.password_hash).toBeDefined()
    const edit = await request(app).put('/api/users/1').set(auth(bob)).send({ name: 'Hacked', email: 'hacked@x.test' })
    expect(edit.body.name).toBe('Hacked')
  })

  it('BE-12 a member can call admin endpoints', async () => {
    const bob = await login('bob@acme.com')
    const users = await request(app).get('/api/admin/users').set(auth(bob))
    expect(users.status).toBe(200)
    expect(users.body).toHaveLength(4)
    const org = await request(app).post('/api/admin/orgs').set(auth(bob)).send({ name: 'Evil Corp', plan: 'free' })
    expect(org.status).toBe(201)
  })

  it('BE-14 a user in org 1 can export org 2', async () => {
    const bob = await login('bob@acme.com')
    const res = await request(app).post('/api/export').set(auth(bob)).send({ orgId: 2 })
    expect(res.status).toBe(200)
    const lines = res.text.split('\n').slice(1)
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.every(l => l.split(',')[1] === '"2"')).toBe(true)
  })

  it('SA-06 a Slack outage makes report creation fail, and email and SMS are skipped', async () => {
    const post = vi.spyOn(axios, 'post').mockRejectedValue(new Error('Slack is down'))
    await expect(createReport(1, 1, { title: 'Quarterly', value: 100 })).rejects.toThrow('Slack is down')
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('DA-01 orgId is concatenated into SQL', async () => {
    const res = await request(app).get('/api/reports').query({ orgId: "1' OR '1'='1" })
    expect(res.body.total).toBe(60)
  })

  it('DA-06 the cache serves stale data after an update', async () => {
    const first = await getReport(1)
    await query(`UPDATE reports SET title = 'Changed' WHERE id = 1`)
    const second = await getReport(1)
    expect(second.title).toBe(first.title)
    expect(second.title).not.toBe('Changed')
  })

  it('DA-07 concurrent cache misses all hit the database', async () => {
    clearCache()
    const spy = vi.spyOn(pg, 'query')
    await Promise.all(Array.from({ length: 10 }, () => getReport(1)))
    const hits = spy.mock.calls.filter(c => String(c[0]).includes('SELECT * FROM reports WHERE id')).length
    expect(hits).toBe(10)
  })

  it('DA-09 fetching reports with authors runs one query per report', async () => {
    const spy = vi.spyOn(pg, 'query')
    const reports = await getReportsWithAuthors(1)
    expect(reports.length).toBeGreaterThan(20)
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(1 + reports.length)
  })

  it('DA-10 when the notification fails the report and audit entry still exist', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('Slack is down'))
    await expect(createReport(1, 1, { title: 'Orphan', value: 5 })).rejects.toThrow('Slack is down')
    const [{ n: reports }] = await query(`SELECT count(*)::int AS n FROM reports WHERE title = 'Orphan'`)
    const [{ n: audits }] = await query(`SELECT count(*)::int AS n FROM audit_log WHERE action = 'report.created'`)
    expect(reports).toBe(1)
    expect(audits).toBe(1)
  })

  it('DA-12 deleting a user who owns reports fails with a 500', async () => {
    const bob = await login('bob@acme.com')
    const res = await request(app).delete('/api/admin/users/1').set(auth(bob))
    expect(res.status).toBe(500)
    const [{ n }] = await query('SELECT count(*)::int AS n FROM users WHERE id = 1')
    expect(n).toBe(1)
  })
})
