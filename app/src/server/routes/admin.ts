// INTERVIEWER-ANNOTATION-START
// [BE-10 · T3 · maintainability] There is no central authorisation: each route would need ad-hoc role checks, so a new role means auditing every route.
//     Look near: router.delete('/users/:id', authenticate
// [BE-12 · T2 · security] Admin routes only check that the caller is logged in: role enforcement exists only by hiding buttons in the React app.
//     Look near: router.get('/users', authenticate
// INTERVIEWER-ANNOTATION-END
import { Router } from 'express'
import * as db from '../db/queries'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/users', authenticate, async (_req, res) => {
  try {
    const users = await db.getAllUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

router.delete('/users/:id', authenticate, async (req, res) => {
  try {
    await db.deleteUser(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

router.get('/audit-log', authenticate, async (_req, res) => {
  try {
    const logs = await db.getAuditLog()
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

router.post('/orgs', authenticate, async (req, res) => {
  try {
    const org = await db.createOrg(req.body)
    res.status(201).json(org)
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

export default router
