import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite, types } from '@electric-sql/pglite'

// Embedded Postgres so the app runs with zero setup. Treat it as Postgres 16.
// (The production configuration in config.ts points at a hosted instance.)
export const pg = new PGlite({
  parsers: { [types.TIMESTAMP]: (v: string) => new Date(v.replace(' ', 'T') + 'Z') }
})

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), '../../../database/schema.sql')

export async function initDb() {
  await pg.exec(readFileSync(schemaPath, 'utf8'))
}

export async function resetDb() {
  await pg.exec('TRUNCATE audit_log, reports, users, orgs RESTART IDENTITY CASCADE')
}

// Raw query: used by routes that build SQL via string interpolation
export async function raw(sql: string): Promise<any[]> {
  const result = await pg.query(sql)
  return result.rows
}

// Parameterised query
export async function query(sql: string, params: unknown[] = []): Promise<any[]> {
  const result = await pg.query(sql, params)
  return result.rows
}

export async function getReports(orgId: number, _filters: Record<string, unknown> = {}) {
  return query(
    'SELECT id, title, status, value, created_by, created_at FROM reports WHERE org_id = $1 ORDER BY created_at DESC LIMIT 100',
    [orgId]
  )
}

export async function getUserById(userId: number | string) {
  const rows = await query('SELECT * FROM users WHERE id = $1', [userId])
  return rows[0]
}

export async function getUserByEmail(email: string) {
  const rows = await query('SELECT * FROM users WHERE email = $1', [email])
  return rows[0]
}

export async function getAllUsers() {
  return query('SELECT * FROM users')
}

export async function updateUser(userId: number | string, data: { name: string; email: string }) {
  const { name, email } = data
  const rows = await query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, userId])
  return rows[0]
}

export async function deleteUser(userId: number | string) {
  await query('DELETE FROM users WHERE id = $1', [userId])
}

export async function insertReport(data: { orgId: number; userId: number; title: string; value?: number; status?: string }) {
  const { orgId, userId, title, value, status } = data
  const rows = await query(
    'INSERT INTO reports (org_id, created_by, title, value, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [orgId, userId, title, value ?? null, status || 'draft']
  )
  return rows[0]
}

export async function insertAuditLog(entry: { action: string; entityId: number; userId: number; orgId: number }) {
  const { action, entityId, userId, orgId } = entry
  await query('INSERT INTO audit_log (action, entity_id, user_id, org_id) VALUES ($1,$2,$3,$4)', [action, entityId, userId, orgId])
}

export async function deleteReport(reportId: number | string) {
  await query('DELETE FROM reports WHERE id = $1', [reportId])
}

export async function getAllReportsForExport(orgId: number, _filters?: unknown) {
  return query('SELECT * FROM reports WHERE org_id = $1', [orgId])
}

export async function getAuditLog() {
  return query('SELECT * FROM audit_log ORDER BY created_at DESC')
}

export async function createOrg(data: { name: string; plan?: string }) {
  const rows = await query('INSERT INTO orgs (name, plan) VALUES ($1,$2) RETURNING *', [data.name, data.plan])
  return rows[0]
}
