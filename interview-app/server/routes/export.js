const express = require('express')
const db = require('../db/queries')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

// [BE-T1] Synchronous CSV generation runs in the request handler and blocks
//         the Node.js event loop for the entire duration (~30s for large datasets).
//         While one export runs, every other request on the server hangs.
//
// [BE-T2] No background job queue — no way for the client to poll status,
//         no retry on failure, no progress tracking.
//         Large exports should be queued (e.g. BullMQ), with the client
//         polling a /export/:jobId/status endpoint.

function generateCSV(rows) {
  const headers = Object.keys(rows[0]).join(',')
  const lines = rows.map(r =>
    Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  )
  return [headers, ...lines].join('\n')
}

router.post('/', authenticate, async (req, res) => {
  const { orgId, filters } = req.body

  // Fetches potentially hundreds of thousands of rows into memory
  const rows = await db.getAllReportsForExport(orgId, filters)

  // Synchronous — blocks the event loop until complete
  const csv = generateCSV(rows)

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="reports.csv"')
  res.send(csv)
})

module.exports = router
