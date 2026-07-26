const Redis = require('ioredis')
const config = require('../config')

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
})

// [DA-T2] Cache-aside pattern implemented without invalidation.
//         When a report is updated, the cached version is never evicted.
//         Users see stale data until the process restarts.
//         No TTL is set — entries live forever.
//
// [DA-T3] Cache stampede risk — when a popular key expires (or on cold start),
//         many concurrent requests all find a cache miss and simultaneously
//         fire the same expensive DB query. The DB spikes hard for a few seconds.
//         Should use: probabilistic early expiry, mutex locking, or
//         background refresh to prevent thundering herd.

async function getReport(id) {
  const cached = await redis.get(`report:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }

  // Cache miss — fetch from DB (import avoided here to prevent circular dep)
  const { query } = require('../db/queries')
  const rows = await query('SELECT * FROM reports WHERE id = $1', [id])
  const report = rows[0]

  if (report) {
    // No TTL argument — cached forever
    await redis.set(`report:${id}`, JSON.stringify(report))
  }

  return report
}

// Called when a report is created — but NOT when updated or deleted
async function invalidateReport(id) {
  await redis.del(`report:${id}`)
}

// No invalidation called anywhere on update or delete

module.exports = { getReport, invalidateReport }
