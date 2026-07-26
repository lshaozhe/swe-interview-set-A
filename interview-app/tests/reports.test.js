const { createReport, getReportsWithAuthors } = require('../server/services/reportService')
const db = require('../server/db/queries')

// [SA-T2] Tests assert on implementation details (which internal functions were called)
//         rather than observable behaviour (what the output is).
//         Any internal refactor breaks these tests even if behaviour is unchanged.
//
// [SA-T3] Only unit tests exist — no integration tests verifying that routes,
//         middleware, auth, and DB work together. A misconfigured middleware
//         chain or missing route handler would not be caught here.

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

    // Testing implementation detail — which function was called and with what args
    // Should instead test: does the returned report have the right shape?
    expect(db.insertReport).toHaveBeenCalledWith({
      orgId: 1,
      userId: 42,
      title: 'Test Report',
      value: 100
    })
  })

  it('calls insertAuditLog after creating report', async () => {
    await createReport(1, 42, { title: 'Test Report', value: 100 })

    // Again testing internal call sequence, not the side-effect outcome
    expect(db.insertAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'report.created' })
    )
  })

  it('throws if db.insertReport fails', async () => {
    db.insertReport.mockRejectedValue(new Error('DB error'))
    await expect(createReport(1, 42, { title: 'X' })).rejects.toThrow('DB error')
    // Does not verify the audit log was NOT written in this case (it wasn't, but
    // there's no test ensuring the two writes are atomic)
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

    // Tests that getUserById was called twice — but doesn't flag the N+1 pattern
    expect(db.getUserById).toHaveBeenCalledTimes(2)
    expect(result[0].author).toBeDefined()
  })
})
