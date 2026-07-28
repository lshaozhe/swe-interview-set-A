const { Pool } = require('pg')
const config = require('../config')

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password
})

async function raw(sql) {
  const result = await pool.query(sql)
  return result.rows
}

async function query(sql, params) {
  const result = await pool.query(sql, params)
  return result.rows
}

async function getReports(orgId, filters = {}) {
  const result = await pool.query(
    'SELECT id, title, status, value, created_by, created_at FROM reports WHERE org_id = $1 ORDER BY created_at DESC LIMIT 100',
    [orgId]
  )
  return result.rows
}

async function getUserById(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
  return result.rows[0]
}

async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users')
  return result.rows
}

async function updateUser(userId, data) {
  const { name, email } = data
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
    [name, email, userId]
  )
  return result.rows[0]
}

async function deleteUser(userId) {
  await pool.query('DELETE FROM users WHERE id = $1', [userId])
}

async function insertReport(data) {
  const { orgId, userId, title, value, status } = data
  const result = await pool.query(
    'INSERT INTO reports (org_id, created_by, title, value, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [orgId, userId, title, value, status || 'draft']
  )
  return result.rows[0]
}

async function insertAuditLog(entry) {
  const { action, entityId, userId, orgId } = entry
  await pool.query(
    'INSERT INTO audit_log (action, entity_id, user_id, org_id) VALUES ($1,$2,$3,$4)',
    [action, entityId, userId, orgId]
  )
}

async function deleteReport(reportId) {
  await pool.query('DELETE FROM reports WHERE id = $1', [reportId])
}

async function getAllReportsForExport(orgId, filters) {
  const result = await pool.query(
    'SELECT * FROM reports WHERE org_id = $1',
    [orgId]
  )
  return result.rows
}

async function getAuditLog() {
  const result = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC')
  return result.rows
}

async function createOrg(data) {
  const { name, plan } = data
  const result = await pool.query(
    'INSERT INTO orgs (name, plan) VALUES ($1,$2) RETURNING *',
    [name, plan]
  )
  return result.rows[0]
}

module.exports = {
  raw, query, getReports, getUserById, getAllUsers, updateUser, deleteUser,
  insertReport, insertAuditLog, deleteReport, getAllReportsForExport,
  getAuditLog, createOrg
}
