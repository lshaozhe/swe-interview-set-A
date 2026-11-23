// INTERVIEWER-ANNOTATION-START
// [BE-16 · T2 · reliability] A malformed login body throws inside an async handler (unhandled rejection), and nothing slows brute force.
//     Look near: loginSchema.parse(req.body)
// INTERVIEWER-ANNOTATION-END
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { loginSchema } from '../../shared/schemas'
import config from '../config'
import { getUserByEmail } from '../db/queries'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)
  const user = await getUserByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, orgId: user.org_id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, orgId: user.org_id } })
})

export default router
