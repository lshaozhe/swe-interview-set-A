const { createReport, getReportsWithAuthors } = require('../server/services/reportService')
const db = require('../server/db/queries')

jest.mock('../server/db/queries')
jest.mock('../server/services/notificationService')

describe('createReport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    db.insertReport.mockResolvedValue({ id: 1, title: 'Test Report', org_id: 1 })
    db.insertAuditLog.mockResolvedValue()
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

    expect(db.insertAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'report.created' })
    )
  })

  it('throws if db.insertReport fails', async () => {
    db.insertReport.mockRejectedValue(new Error('DB error'))
    await expect(createReport(1, 42, { title: 'X' })).rejects.toThrow('DB error')
  })
})

describe('getReportsWithAuthors', () => {
  it('returns reports with author field populated', async () => {
    db.getReports.mockResolvedValue([
      { id: 1, title: 'R1', created_by: 10 },
      { id: 2, title: 'R2', created_by: 11 }
    ])
    db.getUserById.mockResolvedValue({ id: 10, name: 'Alice' })

    const result = await getReportsWithAuthors(1)

    expect(db.getUserById).toHaveBeenCalledTimes(2)
    expect(result[0].author).toBeDefined()
  })
})
