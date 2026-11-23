// INTERVIEWER-ANNOTATION-START
// [BE-02 · T1 · reliability] Async handlers have no try/catch; in Express 4 a rejected promise is an unhandled rejection that can crash the process.
//     Look near: const user = await db.getUserById(req.params.id)
// [BE-11 · T2 · security] IDOR: any logged-in user can read or edit any other user's profile; responses include the password hash.
//     Look near: router.put('/:id', authenticate
// INTERVIEWER-ANNOTATION-END
import { Router } from 'express'
import * as db from '../db/queries'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/:id', authenticate, async (req, res) => {
  const user = await db.getUserById(req.params.id)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(user)
})

router.put('/:id', authenticate, async (req, res) => {
  const updated = await db.updateUser(req.params.id, req.body)
  res.json(updated)
})

router.get('/', authenticate, async (_req, res) => {
  const users = await db.getAllUsers()
  res.json(users)
})

export default router
