import bcrypt from 'bcryptjs'
import { query } from './queries'

export async function seedDemo(reportCount = 60) {
  await query(`INSERT INTO orgs (name, plan) VALUES ('Acme Corp', 'pro'), ('Globex Industries', 'enterprise'), ('Initech', 'free')`)
  const hash = await bcrypt.hash('password123', 4)
  await query(
    `INSERT INTO users (org_id, name, email, role, password_hash) VALUES
     (1, 'Alice Tan', 'alice@acme.com', 'admin', $1),
     (1, 'Bob Lim', 'bob@acme.com', 'member', $1),
     (2, 'Carol Chen', 'carol@globex.com', 'admin', $1),
     (3, 'Dave Wong', 'dave@initech.com', 'member', $1)`,
    [hash]
  )
  const orgs = [1, 1, 1, 2, 2, 3]
  const users = [1, 2, 3, 4]
  const statuses = ['draft', 'published', 'archived']
  for (let i = 0; i < reportCount; i++) {
    await query(`INSERT INTO reports (org_id, created_by, title, status, value, created_at) VALUES ($1,$2,$3,$4,$5,$6)`, [
      orgs[i % orgs.length],
      users[i % users.length],
      `Report ${i + 1}`,
      statuses[i % statuses.length],
      (i * 137) % 10000,
      new Date(Date.UTC(2026, 0, 1 + (i % 28), 9)).toISOString().replace('Z', '')
    ])
  }
  return { orgs: 3, users: 4, reports: reportCount }
}
