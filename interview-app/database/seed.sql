-- Seed data for interview-app
-- Provides realistic data volume for discussion

INSERT INTO orgs (name, plan) VALUES
  ('Acme Corp', 'pro'),
  ('Globex Industries', 'enterprise'),
  ('Initech', 'free');

INSERT INTO users (org_id, name, email, role, password_hash) VALUES
  (1, 'Alice Tan', 'alice@acme.com', 'admin', '$2b$10$examplehashedpassword1'),
  (1, 'Bob Lim', 'bob@acme.com', 'member', '$2b$10$examplehashedpassword2'),
  (2, 'Carol Chen', 'carol@globex.com', 'admin', '$2b$10$examplehashedpassword3'),
  (3, 'Dave Wong', 'dave@initech.com', 'member', '$2b$10$examplehashedpassword4');

-- 1000 sample reports across orgs
INSERT INTO reports (org_id, created_by, title, status, value)
SELECT
  (ARRAY[1,1,1,2,2,3])[(random()*5+1)::int],
  (ARRAY[1,2,3,4])[(random()*3+1)::int],
  'Report ' || generate_series,
  (ARRAY['draft','published','archived'])[(random()*2+1)::int],
  (random() * 10000)::numeric(12,2)
FROM generate_series(1, 1000);
