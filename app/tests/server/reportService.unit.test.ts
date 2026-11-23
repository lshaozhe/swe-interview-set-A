// INTERVIEWER-ANNOTATION-START
// [SA-07 · T2 · quality] Unit tests assert which internal functions were called, not observable behaviour, so refactors break them and bugs pass.
//     Look near: toHaveBeenCalledWith({
// INTERVIEWER-ANNOTATION-END
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as db from '../../src/server/db/queries'
import { createReport, getReportsWithAuthors } from '../../src/server/services/reportService'

vi.mock('../../src/server/db/queries')
vi.mock('../../src/server/services/notificationService')

describe('createReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(db.insertReport).mockResolvedValue({ id: 1, title: 'Test Report', org_id: 1 })
    vi.mocked(db.insertAuditLog).mockResolvedValue()
  })

  it('calls insertReport with correct arguments', async () => {
    await createReport(1, 42, { title: 'Test Report', value: 100 })

    expect(db.insertReport).toHaveBeenCalledWith({
      orgId: 1,
      userId: 42,
      title: 'Test Report',
      value: 100
    })
  })

  it('calls insertAuditLog after creating report', async () => {
    await createReport(1, 42, { title: 'Test Report', value: 100 })

    expect(db.insertAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'report.created' }))
  })

  it('throws if db.insertReport fails', async () => {
    vi.mocked(db.insertReport).mockRejectedValue(new Error('DB error'))
    await expect(createReport(1, 42, { title: 'X' })).rejects.toThrow('DB error')
  })
})

describe('getReportsWithAuthors', () => {
  it('returns reports with author field populated', async () => {
    vi.mocked(db.getReports).mockResolvedValue([
      { id: 1, title: 'R1', created_by: 10 },
      { id: 2, title: 'R2', created_by: 11 }
    ])
    vi.mocked(db.getUserById).mockResolvedValue({ id: 10, name: 'Alice' })

    const result = await getReportsWithAuthors(1)

    expect(db.getUserById).toHaveBeenCalledTimes(2)
    expect(result[0].author).toBeDefined()
  })
})
