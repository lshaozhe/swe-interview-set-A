const express = require('express')
const db = require('../db/queries')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

// [BE-T1] Unhandled async errors — no try/catch around await calls.
//         A database failure throws an unhandled rejection and crashes the process.
//
// [DSO-T2] IDOR (Insecure Direct Object Reference) — any authenticated user
//          can fetch any other user's profile by changing the ID in the URL.
//          The route checks that the requester is authenticated, but never checks
//          that req.user.id matches req.params.id or that they share an org.

router.get('/:id', authenticate, async (req, res) => {
  // No ownership check: req.user.id !== req.params.id is never validated
  const user = await db.getUserById(req.params.id)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Returns full user object including sensitive fields
  res.json(user)
})

router.put('/:id', authenticate, async (req, res) => {
  // Also no ownership check — any user can update any other user's profile
  const updated = await db.updateUser(req.params.id, req.body)
  res.json(updated)
})

router.get('/', authenticate, async (req, res) => {
  // Returns all users across all orgs — no org scoping
  const users = await db.getAllUsers()
  res.json(users)
})

module.exports = router
