const db = require('../db/queries')
const notificationService = require('./notificationService')

// [DA-T2] N+1 query — for each report, a separate query fetches the author.
//         100 reports = 101 database round-trips. Should use a JOIN or
//         a single IN-clause query to fetch all authors at once.
//
// [DA-T3] Multi-step write with no database transaction — if the audit log
//         insert or notification fails, the report exists without an audit trail.
//         All three operations should be wrapped in a single transaction.

async function getReportsWithAuthors(orgId, filters = {}) {
  const reports = await db.getReports(orgId, filters)

  // N+1: one DB query per report
  for (const report of reports) {
    report.author = await db.getUserById(report.created_by)
  }

  return reports
}

async function createReport(orgId, userId, data) {
  // Step 1: insert the report
  const report = await db.insertReport({ orgId, userId, ...data })

  // Step 2: insert audit log — if this fails, report exists without audit trail
  await db.insertAuditLog({
    action: 'report.created',
    entityId: report.id,
    userId,
    orgId
  })

  // Step 3: send notification — if Slack/email is down, this throws and
  //         leaves the report in an inconsistent notification state
  await notificationService.send('report.created', { report, userId })

  return report
}

async function deleteReport(reportId, userId) {
  // Hard delete — no soft delete, no audit of who deleted what
  await db.deleteReport(reportId)
}

module.exports = { getReportsWithAuthors, createReport, deleteReport }
