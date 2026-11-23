import * as db from '../db/queries'
import * as notificationService from './notificationService'

export async function getReportsWithAuthors(orgId: number, filters: Record<string, unknown> = {}) {
  const reports: any[] = await db.getReports(orgId, filters)

  for (const report of reports) {
    report.author = await db.getUserById(report.created_by)
  }

  return reports
}

export async function createReport(orgId: number, userId: number, data: { title: string; value?: number; status?: string }) {
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

export async function deleteReport(reportId: number, _userId: number) {
  await db.deleteReport(reportId)
}
