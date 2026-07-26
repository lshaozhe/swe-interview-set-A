-- TeamMetrics Database Schema
-- [DA-T1] No indexes on commonly queried columns (org_id, created_at, status).
--         Every filter/sort triggers a full sequential table scan.
--
-- [DA-T2] No row-level security (RLS) policies. Multi-tenancy enforced only
--         at application level via WHERE org_id = ?. A missing WHERE clause
--         in any query leaks data across all tenants.
--
-- [DA-T3] No table partitioning strategy. The reports table is projected to
--         grow to 50M rows. No archival, no TTL, no range partitioning by date.

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
  -- No: updated_at, deleted_at (no soft delete), last_login_at
);

CREATE TABLE reports (
  id          SERIAL PRIMARY KEY,
  org_id      INTEGER REFERENCES orgs(id),   -- no index
  created_by  INTEGER REFERENCES users(id),
  title       VARCHAR(500) NOT NULL,
  status      VARCHAR(50) DEFAULT 'draft',    -- no index
  value       NUMERIC(12, 2),
  data        JSONB,
  created_at  TIMESTAMP DEFAULT NOW()         -- no index
  -- No: updated_at, deleted_at, version (no optimistic locking)
);

CREATE TABLE audit_log (
  id          SERIAL PRIMARY KEY,
  org_id      INTEGER,                        -- no index, no FK constraint
  user_id     INTEGER,                        -- no index, no FK constraint
  entity_id   INTEGER,
  action      VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()         -- no index
);

-- No RLS policies:
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY org_isolation ON reports USING (org_id = current_setting('app.org_id')::int);

-- No indexes:
-- CREATE INDEX idx_reports_org_id ON reports(org_id);
-- CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
-- CREATE INDEX idx_reports_status ON reports(status);
-- CREATE INDEX idx_audit_log_org_id ON audit_log(org_id);
