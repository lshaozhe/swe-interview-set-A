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
