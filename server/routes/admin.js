const express = require('express')
const db = require('../db/queries')
const { authenticate } = require('../middleware/auth')
const router = express.Router()

router.get('/users', authenticate, async (req, res) => {
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
