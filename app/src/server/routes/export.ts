import { Router } from 'express'
import * as db from '../db/queries'
import { authenticate } from '../middleware/auth'

const router = Router()

function generateCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0]).join(',')
  const lines = rows.map(r =>
    Object.values(r)
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
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

export default router
