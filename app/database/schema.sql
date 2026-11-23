-- INTERVIEWER-ANNOTATION-START
-- [DA-03 · T1 · performance] No indexes on org_id, status or created_at, so every filter scans the table.
--     Look near: CREATE TABLE reports (
-- [DA-04 · T2 · security] Tenant isolation exists only in application WHERE clauses: no row-level security, so one missed clause leaks data.
--     Look near: org_id      INTEGER REFERENCES orgs(id),
-- [DA-05 · T3 · performance] No partitioning, archival or retention for a table expected to reach tens of millions of rows.
--     Look near: data        JSONB,
-- [DA-14 · T2 · correctness] Timestamps lack a time zone, there is no updated_at, deleted_at or version column, so no optimistic locking or history.
--     Look near: created_at  TIMESTAMP DEFAULT NOW()
-- [DA-15 · T2 · data-integrity] audit_log has no foreign keys, indexes or immutability.
--     Look near: CREATE TABLE audit_log (
-- INTERVIEWER-ANNOTATION-END
-- TeamMetrics database schema

CREATE TABLE orgs (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  plan        VARCHAR(50) DEFAULT 'free',
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  org_id      INTEGER REFERENCES orgs(id),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  role        VARCHAR(50) DEFAULT 'member',  -- 'admin', 'member'
  password_hash VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reports (
  id          SERIAL PRIMARY KEY,
  org_id      INTEGER REFERENCES orgs(id),
  created_by  INTEGER REFERENCES users(id),
  title       VARCHAR(500) NOT NULL,
  status      VARCHAR(50) DEFAULT 'draft',
  value       NUMERIC(12, 2),
  data        JSONB,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_log (
  id          SERIAL PRIMARY KEY,
  org_id      INTEGER,
  user_id     INTEGER,
  entity_id   INTEGER,
  action      VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()
);
