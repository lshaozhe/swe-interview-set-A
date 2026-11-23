// INTERVIEWER-ANNOTATION-START
// [DA-06 · T2 · correctness] The cache has no TTL and no invalidation on update or delete: users see stale data forever.
//     Look near: await redis.set(`report:${id}`, JSON.stringify(report))
// [DA-07 · T3 · performance] Cache stampede: concurrent misses all hit the database.
//     Look near: const rows = await query('SELECT * FROM reports WHERE id = $1', [id])
// INTERVIEWER-ANNOTATION-END
import { query } from '../db/queries'

// In-process stand-in for the Redis client so the app runs without a Redis server.
const store = new Map<string, string>()
const redis = {
  async get(key: string) {
    return store.get(key) ?? null
  },
  async set(key: string, value: string) {
    store.set(key, value)
  },
  async del(key: string) {
    store.delete(key)
  }
}

export function clearCache() {
  store.clear()
}

export async function getReport(id: number | string) {
  const cached = await redis.get(`report:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }

  const rows = await query('SELECT * FROM reports WHERE id = $1', [id])
  const report = rows[0]

  if (report) {
    await redis.set(`report:${id}`, JSON.stringify(report))
  }

  return report
}

export async function invalidateReport(id: number | string) {
  await redis.del(`report:${id}`)
}
