// INTERVIEWER-ANNOTATION-START
// [SA-05 · T1 · maintainability] Filtering, formatting and pagination logic lives in the route handler.
//     Look near: const formatted = rows.map(r => ({
// [BE-03 · T1 · security] The reports routes have no authentication: anyone can read any organisation's reports.
//     Look near: router.get('/', async (req, res) => {
// [DA-01 · T1 · security] orgId and status from the query string are interpolated into SQL (injection).
//     Look near: WHERE org_id = '${orgId}'
// [DA-02 · T1 · performance] SELECT * with no LIMIT returns every column and row.
//     Look near:     SELECT *
// INTERVIEWER-ANNOTATION-END
import { Router } from 'express'
import { getReport } from '../cache/redis'
import * as db from '../db/queries'
import { authenticate } from '../middleware/auth'
import { createReport } from '../services/reportService'

const router = Router()

router.get('/', async (req, res) => {
  const { orgId, status } = req.query

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
    value: `$${Number(r.value).toFixed(2)}`,
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

router.get('/:id/cached', authenticate, async (req, res) => {
  const report = await getReport(req.params.id)
  if (!report) return res.status(404).json({ error: 'Not found' })
  res.json(report)
})

router.post('/', authenticate, async (req, res) => {
  const report = await createReport(req.user!.orgId, req.user!.id, req.body)
  res.status(201).json(report)
})

export default router
