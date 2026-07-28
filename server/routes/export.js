const express = require('express')
const db = require('../db/queries')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

function generateCSV(rows) {
  const headers = Object.keys(rows[0]).join(',')
  const lines = rows.map(r =>
    Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  )
  return [headers, ...lines].join('\n')
}

router.post('/', authenticate, async (req, res) => {
  const { orgId, filters } = req.body

  const rows = await db.getAllReportsForExport(orgId, filters)

  const csv = generateCSV(rows)

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="reports.csv"')
  res.send(csv)
})

module.exports = router
