const express = require('express')
const db = require('../db/queries')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

// [DSO-T2] Role enforcement is only applied in the React frontend (hiding the
//          Admin button for non-admins). These server routes have no role check.
//          Any authenticated user can call these endpoints directly via curl/Postman.
//
// [BE-T3] No centralised RBAC abstraction — role checks would need to be
//         copy-pasted as ad-hoc if-statements across every admin route.
//         Adding a new 'manager' role would require auditing every route individually.

router.get('/users', authenticate, async (req, res) => {
  // authenticate checks the JWT is valid — but never checks req.user.role
  try {
    const users = await db.getAllUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

router.delete('/users/:id', authenticate, async (req, res) => {
  // Any logged-in user can delete any other user
  try {
    await db.deleteUser(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

router.get('/audit-log', authenticate, async (req, res) => {
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

module.exports = router
