const db = require('../db/queries')
const notificationService = require('./notificationService')

async function getReportsWithAuthors(orgId, filters = {}) {
  const reports = await db.getReports(orgId, filters)

  for (const report of reports) {
    report.author = await db.getUserById(report.created_by)
  }

  return reports
}

async function createReport(orgId, userId, data) {
  const report = await db.insertReport({ orgId, userId, ...data })

  await db.insertAuditLog({
    action: 'report.created',
    entityId: report.id,
    userId,
    orgId
  })

  await notificationService.send('report.created', { report, userId })

  return report
}

async function deleteReport(reportId, userId) {
  await db.deleteReport(reportId)
}

module.exports = { getReportsWithAuthors, createReport, deleteReport }
