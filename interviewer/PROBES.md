# Probe sheet (generated from flaws.yaml; do not edit by hand)

Interviewer only. Pick 3 to 4 skills. Start with the open prompt in the guide, then use these only if the conversation gets there. Ladder each probe: *what do you notice* → *why does it matter in production* → *how would you fix and prove it* → *what breaks if…*

---

## FE · Frontend Engineering

### T1 · spot it and explain the impact (S1)

**FE-01** · `src/client/components/Dashboard.tsx` · *performance*
- Flaw: Totals are recomputed on every render and the component is not memoised, so any parent re-render repeats the work.
- Ask: "The page feels slow with a few thousand reports. Where do you start?"
- Strong answer: Profiles first; names useMemo and React.memo and when they help; avoids premature optimisation.
- To move up: Describe a time you used the React profiler to find the real cause.

**FE-03** · `src/client/components/ReportTable.tsx` · *performance*
- Flaw: Every row is rendered into the DOM at once; no virtualisation or pagination.
- Ask: "What happens with 10,000 reports?"
- Strong answer: Virtualisation (TanStack Virtual) or server pagination; measures first.
- To move up: Compare pagination and virtualisation.

**FE-05** · `src/client/components/UserProfile.tsx` · *correctness*
- Flaw: The request is made in the component body, not an effect: it fires on every render, loops with setState, and has no error state or cleanup.
- Ask: "Open the network tab on the profile page. What do you see?"
- Strong answer: Spots a request loop; moves to a hook or TanStack Query; adds loading and error states.
- To move up: Explain how render and effects differ.

**FE-12** · `src/client/pages/LoginPage.tsx` · *a11y*
- Flaw: Inputs have no labels, errors are not announced, and the form relies on colour for the error.
- Ask: "How would a screen-reader user sign in?"
- Strong answer: Labels, role=alert or aria-live, not colour alone.
- To move up: Describe accessible form errors.

### T2 · fix it and explain why it matters in production (S2)

**FE-02** · `src/client/components/Dashboard.tsx` · *performance*
- Flaw: Filter state lives in Dashboard, so every keystroke re-renders the whole dashboard including the table.
- Ask: "Type quickly in the search box. What re-renders?"
- Strong answer: Explains lifting state down; colocation; memoising the table or debouncing.
- To move up: Explain where state should live and why.

**FE-06** · `src/client/components/ExportButton.tsx` · *reliability*
- Flaw: The button is not disabled while the request runs (double submit), and the UI expects a jobId the API never returns.
- Ask: "Click Export twice quickly. What happens, and what does the user see?"
- Strong answer: Single-flight guard; disabled state; matches the contract; shows progress.
- To move up: Describe how you prevent duplicate submissions end to end.

**FE-07** · `src/client/hooks/usePolling.ts` · *reliability*
- Flaw: The interval is never cleared, so each mount adds another timer and the app slows down over time; onData is missing from the dependencies.
- Ask: "Navigate between pages ten times. What happens to the number of requests?"
- Strong answer: Finds the leak; returns a cleanup; discusses AbortController and visibility.
- To move up: Explain effect cleanup with an example.

**FE-08** · `src/client/utils/format.ts` · *correctness*
- Flaw: Dates render in the viewer's timezone, so the same report shows different times to different users.
- Ask: "A Singapore user and a London user compare timestamps. What do they see?"
- Strong answer: Names browser-local formatting; fixed timezone or user preference with Intl.DateTimeFormat.
- To move up: Describe how you store and show timestamps.

**FE-09** · `src/client/hooks/useReports.ts` · *correctness*
- Flaw: filters are missing from the effect dependencies, so the data never refetches when filters change.
- Ask: "Change a filter. What happens to the data?"
- Strong answer: Notes the dependency array and lint rule; considers TanStack Query with the filter in the key.
- To move up: Explain how dependency arrays are checked.

**FE-11** · `src/client/api/client.ts` · *reliability*
- Flaw: There is no timeout and no response interceptor: 401s and 500s are handled inconsistently by each caller, and nothing retries transient failures.
- Ask: "The API stops responding. What does the user see?"
- Strong answer: Timeout, central error handling, 401 redirect, retry policy for safe calls.
- To move up: Design a shared API client.

**FE-13** · `src/client/components/ReportTable.tsx` · *a11y*
- Flaw: The data table has no caption or header scope, and focus outlines are removed globally.
- Ask: "Navigate this table with a keyboard only."
- Strong answer: Caption, th scope, visible focus, testing with a screen reader and axe.
- To move up: Run an accessibility audit on a screen you built.

**FE-14** · `src/client/components/Dashboard.tsx` · *correctness*
- Flaw: Totals are calculated by parsing formatted strings the server produced, so thousands separators or another currency silently break the sum.
- Ask: "What happens when a value is $1,200.00?"
- Strong answer: Notes display formatting leaking into logic; the API should send numbers; format at the edge.
- To move up: Explain why you keep raw values separate from display values.

### T3 · failure modes and trade-offs (S3)

**FE-04** · `src/client/components/OrgSwitcher.tsx` · *correctness*
- Flaw: The focus listener closes over the first value of currentOrg, is never removed and stacks up, so the wrong org's data is synced when the tab regains focus.
- Ask: "Switch org, then tab away and back. What gets synced?"
- Strong answer: Explains stale closure, dependency array and cleanup; refs or functional updates.
- To move up: Explain closures in effects with an example.

**FE-10** · `src/client/hooks/useReports.ts` · *correctness*
- Flaw: No AbortController: fast filter changes race and the last response to arrive wins, not the last request sent.
- Ask: "Change filters quickly on a slow network. Which result do you see?"
- Strong answer: Describes the race; abort or ignore stale responses; or use a library that handles it.
- To move up: Explain request races and two ways to avoid them.

---

## BE · Backend Engineering

### T1 · spot it and explain the impact (S1)

**BE-01** · `src/server/index.ts` · *security*
- Flaw: CORS is wide open to every origin.
- Ask: "Which sites can call this API from a browser?"
- Strong answer: Allowlist origins; credentials; understand what CORS does and does not stop.
- To move up: Explain what CORS protects.

**BE-02** · `src/server/routes/users.ts` · *reliability*
- Flaw: Async handlers have no try/catch; in Express 4 a rejected promise is an unhandled rejection that can crash the process.
- Ask: "The database blips. What happens to the API?"
- Strong answer: Error handling, wrapper or Express 5, global handler, process policy.
- To move up: Explain how errors flow through Express.

**BE-03** · `src/server/routes/reports.ts` · *security* · proof test · chain: authz
- Flaw: The reports routes have no authentication: anyone can read any organisation's reports.
- Ask: "Call GET /api/reports?orgId=2 with no token."
- Strong answer: Auth middleware and tenant scoping from the token, not the query.
- To move up: Explain tenant scoping.

**BE-04** · `src/server/index.ts` · *security* · proof test
- Flaw: No rate limiting is applied anywhere (the limiter exists but is never mounted).
- Ask: "How fast can someone guess passwords here?"
- Strong answer: Applies per-user and per-IP limits; brute-force protection.
- To move up: Compare rate limit strategies.

**BE-07** · `src/server/index.ts` · *reliability*
- Flaw: There is no error-handling middleware and no process-level handler for unhandled rejections.
- Ask: "What is the last line of defence when a handler throws?"
- Strong answer: Error middleware, process handlers, crash-and-restart policy.
- To move up: Describe a safe failure policy for a Node service.

**BE-08** · `src/server/routes/export.ts` · *performance*
- Flaw: CSV generation runs synchronously in the request and blocks the event loop for large exports.
- Ask: "One user exports 500,000 rows. What happens to everyone else?"
- Strong answer: Streaming, worker, or background job.
- To move up: Explain the Node event loop and blocking work.

### T2 · fix it and explain why it matters in production (S2)

**BE-05** · `src/server/middleware/auth.ts` · *security* · proof test · chain: authz
- Flaw: decode() does not verify the signature or expiry, so forged and expired tokens are accepted.
- Ask: "Can I make my own token?"
- Strong answer: Uses verify; checks expiry and algorithm; explains why decode is not authentication.
- To move up: Explain what a JWT signature protects.

**BE-06** · `src/server/index.ts` · *observability*
- Flaw: No request id, access logging or correlation across services.
- Ask: "A user reports an error at 10:42. How do you find it?"
- Strong answer: Request id, structured logs, tracing.
- To move up: Describe what you log for every request.

**BE-09** · `src/server/routes/export.ts` · *reliability*
- Flaw: There is no job queue: no status, retry or progress for exports.
- Ask: "How does a user know their export finished?"
- Strong answer: Queue (BullMQ), status endpoint, notification.
- To move up: Design an export job end to end.

**BE-11** · `src/server/routes/users.ts` · *security* · proof test · chain: authz
- Flaw: IDOR: any logged-in user can read or edit any other user's profile; responses include the password hash.
- Ask: "Can Bob read Alice's profile? What fields come back?"
- Strong answer: Ownership and org checks; response DTO; never return hashes.
- To move up: Explain IDOR and how you test for it.

**BE-12** · `src/server/routes/admin.ts` · *security* · proof test · chain: authz
- Flaw: Admin routes only check that the caller is logged in: role enforcement exists only by hiding buttons in the React app.
- Ask: "Can a member call the admin endpoints directly?"
- Strong answer: Server-side role checks; deny by default.
- To move up: Explain why UI hiding is not authorisation.

**BE-13** · `src/server/db/queries.ts` · *correctness*
- Flaw: Profile updates write whatever is sent: no validation, uniqueness handling or mass-assignment control.
- Ask: "Send an empty email. What happens?"
- Strong answer: Zod validation, allowed fields, conflict handling.
- To move up: Show validation at an API boundary.

**BE-14** · `src/server/routes/export.ts` · *security* · proof test · chain: authz
- Flaw: The org to export comes from the request body, so any user can export any organisation's data.
- Ask: "Export orgId 2 as a user in org 1."
- Strong answer: Take org from the token; add tests.
- To move up: Explain tenant scoping again, differently.

**BE-16** · `src/server/routes/auth.ts` · *reliability*
- Flaw: A malformed login body throws inside an async handler (unhandled rejection), and nothing slows brute force.
- Ask: "Send an invalid JSON shape to /login."
- Strong answer: Safe parsing with 400; lockout; rate limit.
- To move up: Handle invalid input without crashing.

### T3 · failure modes and trade-offs (S3)

**BE-10** · `src/server/routes/admin.ts` · *maintainability*
- Flaw: There is no central authorisation: each route would need ad-hoc role checks, so a new role means auditing every route.
- Ask: "We add a manager role. How many files change?"
- Strong answer: Policy or RBAC middleware, deny by default, tests.
- To move up: Design an authorisation layer.

**BE-15** · `src/server/routes/export.ts` · *security*
- Flaw: CSV cells are quoted but formula characters are not neutralised (CSV injection).
- Ask: "A report title is =HYPERLINK(...). What does Excel do?"
- Strong answer: Prefix risky cells; document trust.
- To move up: Explain why exports are an attack surface.

---

## CL · Cloud Application Engineering

### T1 · spot it and explain the impact (S1)

**CL-01** · `infrastructure/ecs.tf` · *security*
- Flaw: The task role has full administrator permissions.
- Ask: "What can a compromised container do in AWS?"
- Strong answer: Least privilege; scoped actions and resources.
- To move up: Write the policy the task actually needs.

**CL-02** · `infrastructure/ecs.tf` · *reliability*
- Flaw: No container or target-group health check and no log configuration.
- Ask: "A task crashes. What routes traffic to it, and where are its logs?"
- Strong answer: Health checks, log driver, alarms.
- To move up: Explain liveness vs readiness.

**CL-05** · `infrastructure/security-groups.tf` · *security*
- Flaw: The app security group allows all TCP ports from the internet.
- Ask: "Which ports should be reachable?"
- Strong answer: Only the load balancer, only the app port.
- To move up: Design security groups for a three-tier app.

**CL-10** · `infrastructure/ecs.tf` · *security*
- Flaw: Secrets are plain environment variables in the task definition.
- Ask: "Where should these come from?"
- Strong answer: Secrets Manager or SSM; task role.
- To move up: Explain how secrets reach a container.

**CL-11** · `docker-compose.yml` · *security*
- Flaw: Containers run as root with no memory or CPU limits, and secrets are in the compose file.
- Ask: "What would an attacker with code execution in the container own?"
- Strong answer: Non-root user, limits, secrets handling.
- To move up: Harden a compose service.

**CL-13** · `Dockerfile` · *security*
- Flaw: Unpinned latest image, runs as root, installs everything, no multi-stage build or .dockerignore.
- Ask: "What would you change in this Dockerfile?"
- Strong answer: Pin, non-root, multi-stage, production deps.
- To move up: Explain reproducible image builds.

### T2 · fix it and explain why it matters in production (S2)

**CL-03** · `infrastructure/ecs.tf` · *reliability*
- Flaw: Fixed desired count with no autoscaling.
- Ask: "Traffic triples. What happens?"
- Strong answer: Target tracking, load testing, limits.
- To move up: Choose scaling signals.

**CL-06** · `infrastructure/security-groups.tf` · *security* · chain: data
- Flaw: The database security group allows 5432 from 0.0.0.0/0.
- Ask: "Who can connect to the database?"
- Strong answer: Source from app SG only; private subnet.
- To move up: Explain defence in depth for databases.

**CL-07** · `infrastructure/rds.tf` · *security*
- Flaw: No encryption at rest, deletion protection or final snapshot; the instance is publicly accessible.
- Ask: "What do compliance reviews say about this?"
- Strong answer: KMS, private, deletion protection.
- To move up: Explain encryption at rest and what it does not cover.

**CL-08** · `infrastructure/rds.tf` · *reliability*
- Flaw: Automated backups are disabled.
- Ask: "A table is dropped by mistake. What can we recover?"
- Strong answer: Backups, PITR, tested restore.
- To move up: Explain RPO and RTO.

**CL-12** · `docker-compose.yml` · *reliability*
- Flaw: depends_on only waits for start, not health: no healthchecks defined, so the app may start before the database is ready.
- Ask: "Start everything at once. What fails?"
- Strong answer: Healthchecks, condition service_healthy, retry on connect.
- To move up: Explain startup ordering problems.

### T3 · failure modes and trade-offs (S3)

**CL-04** · `infrastructure/ecs.tf` · *reliability*
- Flaw: Tasks run in public subnets with public IPs, with no placement spread or deployment circuit breaker.
- Ask: "One AZ fails. What happens?"
- Strong answer: Private subnets, multi-AZ, circuit breaker, rollback.
- To move up: Draw the network and failure domains.

**CL-09** · `infrastructure/rds.tf` · *reliability*
- Flaw: One instance, no read replica or Multi-AZ: heavy dashboards contend with writes and failure means downtime.
- Ask: "Dashboard queries slow down writes. What do you do?"
- Strong answer: Replica for reads, Multi-AZ, caching.
- To move up: Compare scaling reads and availability.

---

## SA · Software Architecture

### T1 · spot it and explain the impact (S1)

**SA-01** · `src/client/App.tsx` · *reliability*
- Flaw: There is no error boundary, so an uncaught error in any component blanks the whole app.
- Ask: "A component throws during render. What does the user see?"
- Strong answer: Error boundary with fallback and reporting; boundaries per route.
- To move up: Explain what error boundaries do and do not catch.

**SA-02** · `src/client/App.tsx` · *security* · chain: authz
- Flaw: No route guards: /admin and /dashboard render without checking authentication.
- Ask: "Open /admin in a private window."
- Strong answer: Route guard; but the server is the real control; redirects with return URL.
- To move up: Explain why client-side guards are not security.

**SA-05** · `src/server/routes/reports.ts` · *maintainability*
- Flaw: Filtering, formatting and pagination logic lives in the route handler.
- Ask: "Where would you add pagination, and how would you test it?"
- Strong answer: Service layer; thin routes; DTOs.
- To move up: Describe the layers you would use.

### T2 · fix it and explain why it matters in production (S2)

**SA-03** · `src/client/context/AuthContext.tsx` · *performance*
- Flaw: The context value is a new object every render, so every consumer re-renders on any auth change.
- Ask: "What re-renders when the token refreshes?"
- Strong answer: useMemo the value or split contexts; state vs actions.
- To move up: Explain context re-render behaviour.

**SA-04** · `src/client/components/UserProfile.tsx` · *maintainability*
- Flaw: Data fetching is mixed into the component instead of a hook or service.
- Ask: "Where would you test the fetching logic?"
- Strong answer: Extract hook or query; separate view from data.
- To move up: Describe how you separate data from presentation.

**SA-07** · `tests/server/reportService.unit.test.ts` · *quality* · chain: tests
- Flaw: Unit tests assert which internal functions were called, not observable behaviour, so refactors break them and bugs pass.
- Ask: "What would these tests catch, and what would they miss?"
- Strong answer: Behaviour over implementation; fakes; integration tests.
- To move up: Rewrite one of these tests around behaviour.

**SA-09** · `src/shared/schemas.ts` · *maintainability*
- Flaw: A shared response schema exists but is not used by the server or the client; two data-access styles (raw and parameterised) coexist.
- Ask: "What guarantees the API response matches the client's type?"
- Strong answer: Runtime validation at boundaries; one query style.
- To move up: Explain trust boundaries and runtime validation.

### T3 · failure modes and trade-offs (S3)

**SA-06** · `src/server/services/notificationService.ts` · *reliability* · proof test · chain: reliability
- Flaw: Slack, email and SMS are called in sequence on the critical path of report creation: any outage breaks creation, there is no retry, and adding a channel means editing this file.
- Ask: "Slack is down. Can a user create a report?"
- Strong answer: Events and a queue with independent consumers; retries; outbox pattern.
- To move up: Design asynchronous notifications and discuss delivery guarantees.

**SA-08** · `tests/server/reports.api.test.ts` · *quality* · chain: tests
- Flaw: Integration tests cover the happy path only: nothing checks authorisation, tenant isolation, injection, failure of a dependency or concurrency.
- Ask: "All tests are green. What is still unproven?"
- Strong answer: Lists the missing classes of test and prioritises by risk.
- To move up: Choose the three tests that would protect this API most.

---

## DA · Data Architecture

### T1 · spot it and explain the impact (S1)

**DA-01** · `src/server/routes/reports.ts` · *security* · proof test · chain: sqli
- Flaw: orgId and status from the query string are interpolated into SQL (injection).
- Ask: "What if orgId is a single quote?"
- Strong answer: Parameterised queries; explains why escaping is brittle.
- To move up: Explain parameter binding.

**DA-02** · `src/server/routes/reports.ts` · *performance*
- Flaw: SELECT * with no LIMIT returns every column and row.
- Ask: "The org has a million reports. What happens?"
- Strong answer: Explicit columns, pagination, indexes.
- To move up: Design pagination.

**DA-03** · `database/schema.sql` · *performance*
- Flaw: No indexes on org_id, status or created_at, so every filter scans the table.
- Ask: "Which indexes do you add and how do you prove they help?"
- Strong answer: Composite index on org and created_at; EXPLAIN; write cost.
- To move up: Read a query plan aloud.

### T2 · fix it and explain why it matters in production (S2)

**DA-04** · `database/schema.sql` · *security* · chain: authz
- Flaw: Tenant isolation exists only in application WHERE clauses: no row-level security, so one missed clause leaks data.
- Ask: "What database feature could enforce isolation?"
- Strong answer: Row-level security, per-request org setting, defence in depth.
- To move up: Compare app-level and database-level isolation.

**DA-06** · `src/server/cache/redis.ts` · *correctness* · proof test
- Flaw: The cache has no TTL and no invalidation on update or delete: users see stale data forever.
- Ask: "A report is updated. When do users see it?"
- Strong answer: TTL plus event invalidation; cache keys by version.
- To move up: Explain cache invalidation strategies.

**DA-08** · `src/server/db/queries.ts` · *reliability*
- Flaw: No connection pooling or timeouts are configured (production defaults would have no max, idle or connection timeout), so load exhausts connections and queues forever.
- Ask: "What limits how many requests can wait on the database?"
- Strong answer: Pool size vs database limit, timeouts, backpressure, pgbouncer.
- To move up: Size a connection pool.

**DA-09** · `src/server/services/reportService.ts` · *performance* · proof test
- Flaw: N+1: one query per report to fetch its author.
- Ask: "How many queries does a 100-report page run?"
- Strong answer: JOIN or IN query; shows with a query count.
- To move up: Show how you detect N+1.

**DA-11** · `src/server/db/queries.ts` · *security*
- Flaw: getAllUsers returns every user across all orgs, including password hashes.
- Ask: "Who can call this and what do they get?"
- Strong answer: Scope, select needed columns, never hashes.
- To move up: Design response DTOs.

**DA-12** · `src/server/db/queries.ts` · *data-integrity* · proof test
- Flaw: Hard delete with no soft delete or audit; it also fails for any user who created reports (foreign key).
- Ask: "An admin deletes a user who owns reports. What happens?"
- Strong answer: Soft delete or reassign; audit; cascade policy.
- To move up: Choose a deletion strategy.

**DA-13** · `src/server/db/queries.ts` · *performance*
- Flaw: The export query has no LIMIT or streaming and loads everything into memory; the audit log query is also unbounded.
- Ask: "What does the export do at a million rows?"
- Strong answer: Cursor or streaming; pagination for the audit log.
- To move up: Describe streaming a large result.

**DA-14** · `database/schema.sql` · *correctness*
- Flaw: Timestamps lack a time zone, there is no updated_at, deleted_at or version column, so no optimistic locking or history.
- Ask: "Two admins edit the same report. What happens?"
- Strong answer: timestamptz, version column, audit.
- To move up: Explain optimistic locking.

**DA-15** · `database/schema.sql` · *data-integrity*
- Flaw: audit_log has no foreign keys, indexes or immutability.
- Ask: "How would you query one org's audit trail quickly and trust it?"
- Strong answer: Indexes, FKs or snapshot, append-only.
- To move up: Design an audit log.

### T3 · failure modes and trade-offs (S3)

**DA-05** · `database/schema.sql` · *performance*
- Flaw: No partitioning, archival or retention for a table expected to reach tens of millions of rows.
- Ask: "The reports table reaches 50 million rows. What is your plan?"
- Strong answer: Range partitioning, archival, retention, index strategy.
- To move up: Explain partitioning trade-offs.

**DA-07** · `src/server/cache/redis.ts` · *performance* · proof test
- Flaw: Cache stampede: concurrent misses all hit the database.
- Ask: "A hot key expires. What does the database see?"
- Strong answer: Request coalescing, locks, early refresh, jitter.
- To move up: Describe stampede protection.

**DA-10** · `src/server/services/reportService.ts` · *data-integrity* · proof test · chain: reliability
- Flaw: Report, audit entry and notification are separate steps without a transaction: a failure leaves a report with no audit trail or a half-complete request.
- Ask: "The notification fails. What is in the database and what does the caller see?"
- Strong answer: Transaction for DB writes; outbox for side effects; idempotency.
- To move up: Explain transactional boundaries.

---

## DSO · DevSecOps

### T1 · spot it and explain the impact (S1)

**DSO-01** · `src/server/config.ts` · *security*
- Flaw: Production credentials are hard-coded in source.
- Ask: "Who has the database password?"
- Strong answer: Environment or secret manager; rotate; scan history.
- To move up: Explain how to remove a committed secret safely.

**DSO-02** · `src/client/store/authStore.ts` · *security* · chain: authz
- Flaw: The JWT is stored in localStorage, readable by any script on the page.
- Ask: "What can an XSS bug do to this app?"
- Strong answer: HttpOnly cookies; XSS exposure; trade-offs.
- To move up: Compare token storage options.

**DSO-03** · `package.json` · *delivery*
- Flaw: All dependencies use caret ranges, so installs can drift between machines.
- Ask: "Two developers install a week apart. What differs?"
- Strong answer: Lockfile, npm ci, pinning policy, Renovate.
- To move up: Explain semver ranges and lockfiles.

**DSO-05** · `src/client/api/client.ts` · *security*
- Flaw: The API base URL is hard-coded in the client and not HTTPS.
- Ask: "How does this behave in staging?"
- Strong answer: Environment config, HTTPS, build-time vars.
- To move up: Explain configuration in a built SPA.

**DSO-08** · `.github/workflows/ci.yml` · *security*
- Flaw: Cloud credentials are plain text in the workflow.
- Ask: "What do you do if these were real?"
- Strong answer: Rotate, OIDC, secrets.
- To move up: Explain OIDC for CI.

**DSO-16** · `infrastructure/rds.tf` · *security*
- Flaw: The database password is committed in Terraform (and ends up in state).
- Ask: "Where does the password live after apply?"
- Strong answer: Secrets Manager, no secrets in state.
- To move up: Explain Terraform state sensitivity.

### T2 · fix it and explain why it matters in production (S2)

**DSO-04** · `package.json` · *security*
- Flaw: jsonwebtoken 8.x has known CVEs and express 4 has known issues; nothing runs npm audit.
- Ask: "How do you find vulnerable dependencies?"
- Strong answer: npm audit in CI, upgrade policy, SCA.
- To move up: Describe a dependency-risk routine.

**DSO-07** · `tests/server/auth.api.test.ts` · *security*
- Flaw: Tests import the production config module directly; there is no separate test configuration, so a test run could touch production resources if wired to them.
- Ask: "What stops a test from hitting production?"
- Strong answer: Separate config by environment, no prod credentials in tests.
- To move up: Describe how you isolate test environments.

**DSO-09** · `.github/workflows/ci.yml` · *delivery*
- Flaw: No audit, SAST, secret scanning or image scanning; no typecheck or lint.
- Ask: "What does the pipeline not catch?"
- Strong answer: Add scanners and gates.
- To move up: Pick the checks with the best value.

**DSO-12** · `src/server/services/notificationService.ts` · *security*
- Flaw: Third-party API keys are hard-coded.
- Ask: "Where do provider keys live?"
- Strong answer: Secret manager; rotation.
- To move up: Same as DSO-01, applied to vendors.

**DSO-13** · `src/server/middleware/rateLimit.ts` · *security*
- Flaw: The limiter is keyed by IP, so one noisy user behind a shared NAT throttles everyone.
- Ask: "50 people share an office IP. What happens?"
- Strong answer: Key by user or token; per-route limits.
- To move up: Choose rate-limit keys.

### T3 · failure modes and trade-offs (S3)

**DSO-06** · `src/client/components/ExportButton.tsx` · *security*
- Flaw: State-changing POSTs carry no CSRF protection; fine with bearer tokens today, but vulnerable if auth moves to cookies.
- Ask: "If we move to cookies, what else changes?"
- Strong answer: SameSite, CSRF tokens, origin checks.
- To move up: Explain CSRF.

**DSO-10** · `.github/workflows/ci.yml` · *delivery*
- Flaw: Every branch push can deploy to production.
- Ask: "Push a feature branch. What happens?"
- Strong answer: main only, environments, approvals.
- To move up: Design branch and environment rules.

**DSO-11** · `.github/workflows/ci.yml` · *delivery*
- Flaw: No approval gate, no staging, no health verification or rollback.
- Ask: "The new version is broken. What happens next?"
- Strong answer: Staged rollout, health gates, rollback.
- To move up: Describe progressive delivery.

**DSO-14** · `src/server/middleware/rateLimit.ts` · *reliability*
- Flaw: The default in-memory store is per process: three instances give three times the limit and reset on deploy.
- Ask: "We run three instances. What is the real limit?"
- Strong answer: Shared store (Redis) or edge limiting.
- To move up: Design distributed rate limiting.

**DSO-15** · `src/server/middleware/auth.ts` · *security*
- Flaw: There is no token revocation: a stolen or suspended user's token works for 24 hours.
- Ask: "An employee leaves. When does access end?"
- Strong answer: Short tokens, refresh, denylist, session store.
- To move up: Compare stateless and stateful sessions.
