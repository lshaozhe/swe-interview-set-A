import request from 'supertest'
import { initDb, resetDb } from '../../src/server/db/queries'
import { seedDemo } from '../../src/server/db/seed'
import { clearCache } from '../../src/server/cache/redis'
import { createApp } from '../../src/server/index'

export const app = createApp()

let ready = false

export async function freshDb(reports = 60) {
  if (!ready) {
    await initDb()
    ready = true
  }
  await resetDb()
  clearCache()
  return seedDemo(reports)
}

export async function login(email = 'alice@acme.com', password = 'password123') {
  const res = await request(app).post('/api/auth/login').send({ email, password })
  return res.body.token as string
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` })
