const express = require('express')
const db = require('../db/queries')
const router = express.Router()

// [BE-T1] No authentication check — this route is publicly accessible.
//         Any unauthenticated request can read all reports for any org.
//
// [DA-T1] SQL injection — orgId from the query string is interpolated directly
//         into the SQL query. Input like `' OR '1'='1` dumps the entire table.
//
// [SA-T1] Business logic (filtering, pagination, formatting) lives inside
//         the route handler. Should be delegated to a service layer.
//
// [DA-T1] SELECT * with no LIMIT returns all columns and all rows.
//         Full table scan on every request once the table grows.

router.get('/', async (req, res) => {
  const { orgId, status, page } = req.query

  // Direct string interpolation — SQL injection vulnerability
  const query = `
    SELECT *
    FROM reports
    WHERE org_id = '${orgId}'
    ${status ? `AND status = '${status}'` : ''}
    ORDER BY created_at DESC
  `

  const rows = await db.raw(query)

  // Formatting logic in the route
  const formatted = rows.map(r => ({
    ...r,
    value: `$${r.value.toFixed(2)}`,
    createdAt: new Date(r.created_at).toLocaleDateString()
  }))

  res.json({ data: formatted, total: rows.length })
})

router.get('/:id', async (req, res) => {
  // Also no auth check, also injection-vulnerable
  const query = `SELECT * FROM reports WHERE id = '${req.params.id}'`
  const rows = await db.raw(query)
  if (!rows.length) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
})

module.exports = router
