const express = require('express')
const db = require('../db/queries')
const router = express.Router()

router.get('/', async (req, res) => {
  const { orgId, status, page } = req.query

  const query = `
    SELECT *
    FROM reports
    WHERE org_id = '${orgId}'
    ${status ? `AND status = '${status}'` : ''}
    ORDER BY created_at DESC
  `

  const rows = await db.raw(query)

  const formatted = rows.map(r => ({
    ...r,
    value: `$${r.value.toFixed(2)}`,
    createdAt: new Date(r.created_at).toLocaleDateString()
  }))

  res.json({ data: formatted, total: rows.length })
})

router.get('/:id', async (req, res) => {
  const query = `SELECT * FROM reports WHERE id = '${req.params.id}'`
  const rows = await db.raw(query)
  if (!rows.length) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
})

module.exports = router
