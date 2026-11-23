// INTERVIEWER-ANNOTATION-START
// [BE-08 · T1 · performance] CSV generation runs synchronously in the request and blocks the event loop for large exports.
//     Look near: const csv = generateCSV(rows)
// [BE-09 · T2 · reliability] There is no job queue: no status, retry or progress for exports.
//     Look near: router.post('/', authenticate, async (req, res) => {
// [BE-14 · T2 · security] The org to export comes from the request body, so any user can export any organisation's data.
//     Look near: const { orgId, filters } = req.body
// [BE-15 · T3 · security] CSV cells are quoted but formula characters are not neutralised (CSV injection).
//     Look near: `"${String(v).replace(/"/g, '""')}"`
// INTERVIEWER-ANNOTATION-END
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
