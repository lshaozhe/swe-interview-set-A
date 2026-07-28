const express = require('express')
const db = require('../db/queries')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

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

router.get('/', authenticate, async (req, res) => {
  const users = await db.getAllUsers()
  res.json(users)
})

module.exports = router
