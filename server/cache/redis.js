const Redis = require('ioredis')
const config = require('../config')

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
})

async function getReport(id) {
  const cached = await redis.get(`report:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }

  const { query } = require('../db/queries')
  const rows = await query('SELECT * FROM reports WHERE id = $1', [id])
  const report = rows[0]

  if (report) {
    await redis.set(`report:${id}`, JSON.stringify(report))
  }

  return report
}

async function invalidateReport(id) {
  await redis.del(`report:${id}`)
}

module.exports = { getReport, invalidateReport }
