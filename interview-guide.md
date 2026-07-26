# Technical Interview Guide — TeamMetrics Codebase Review

## Overview

This is a code-review-style interview using a realistic but intentionally flawed codebase (`interview-app/`). The app is a multi-tenant analytics dashboard built with React, Express, PostgreSQL, Redis, and deployed on AWS with Terraform.

The interview is **candidate-led, not question-led**. Your job is to listen and probe, not to walk through a checklist. What the candidate notices first, how deep they go without prompting, and how they explain trade-offs tells you far more than whether they hit a specific answer.

---

## Before the Interview

- Share the repo link (or zip) **24 hours before** if you want them to come prepared. This tests async reading and prioritisation.
- Alternatively, share it at the start of the session and give 10 minutes of silent exploration. This tests live instincts.
- Have this guide open but out of sight. Don't refer to it during the interview — let the conversation flow.
- Keep a notes column next to the scoring rubric as you go.

---

## Session Structure (60 minutes)

| Phase | Duration | What you're doing |
|---|---|---|
| Welcome & context setting | 5 min | Explain the app, set expectations |
| Open exploration | 10 min | Candidate explores freely, you observe |
| Guided deep-dives | 35 min | Probe 3–4 areas based on what they found |
| Architecture discussion | 7 min | One big-picture question |
| Wrap-up & candidate questions | 3 min | Close out |

---

## Phase 1 — Context Setting (5 min)

Give the candidate this brief:

> *"This is a simplified version of a multi-tenant analytics dashboard we're building — React frontend, Express backend, PostgreSQL, Redis caching, deployed on AWS. The code is representative of what a previous team left behind. I'd like you to treat this as a code review. Explore the repo and tell me what you notice. There are no trick questions — I'm interested in how you think about code, not whether you hit specific answers."*

Set a relaxed tone. Remind them they can think out loud.

---

## Phase 2 — Open Exploration (10 min)

Stay quiet. Let them drive. Note:

- **Where do they start?** Frontend-first suggests a UI/product instinct. Going straight to `config.js` or `ci.yml` suggests a security or ops mindset. Starting with `schema.sql` suggests a data-first thinker.
- **What's their first comment?** The hardcoded credentials in `config.js` are a T1 issue — anyone should catch that. If they don't, that's signal.
- **How do they navigate?** Do they read linearly or jump between related files? Cross-file thinking (e.g. "this route has no auth, and the middleware only uses `decode` not `verify`...") is a senior signal.
- **Do they look at tests?** Many candidates skip tests entirely. Looking at `tests/` early shows maturity.

After 10 minutes, ask: *"What have you found so far? Walk me through what stood out."*

---

## Phase 3 — Guided Deep-Dives (35 min)

Pick **3–4 areas** based on the role and what the candidate naturally gravitated toward. Don't try to cover everything — depth beats breadth.

Below are probing questions by domain. Use the ones that fit the conversation.

---

### Frontend

**Starting prompt for any FE file:**
> *"What do you notice about how this component is written?"*

**`Dashboard.jsx` — Re-renders**
- "The filter input feels laggy even on a fast machine. Where would you start looking?"
- "How would you prevent a theme change from re-rendering the entire data table?"
- Look for: `React.memo`, `useMemo`, `useCallback`, state colocation

**`ReportTable.jsx` — Virtualisation**
- "This works fine in dev with 50 rows. What happens with 10,000?"
- Look for: `react-window` or `react-virtual`, awareness of DOM node count, memory impact

**`useReports.js` — Hooks**
- "Users report filters don't seem to update the table. Can you find why?"
- If they find the missing dep array, follow up: "What else could go wrong with rapid filter changes?" (AbortController / race condition)
- Look for: dep array awareness, stale closures, cleanup patterns

**`OrgSwitcher.jsx` — Advanced**
- Only worth exploring with strong candidates. "Users say they sometimes see data from a previous org after switching. Where would you look?"
- Look for: understanding of stale closures, event listener cleanup, correct dep array

---

### Backend

**Starting prompt:**
> *"Walk me through what happens when a user loads their reports."*

**`routes/reports.js` — Security + Architecture**
- "Before we talk about what this does — what's the first thing that concerns you?"
- Most candidates should spot the SQL injection. If they do: "Good. What else?"
- Second issue is the missing auth check. Third is the fat route handler.
- Look for: parameterised queries, middleware placement, service layer awareness

**`middleware/auth.js` — JWT**
- "A user's token expired two days ago. Are they still able to call the API?"
- Let them read the code. The bug is `jwt.decode` vs `jwt.verify`.
- If they spot it, go deeper: "Even with `verify` in place, is there anything else that could let a bad actor keep using a stolen token?" (revocation)
- Look for: JWT lifecycle understanding, token storage, revocation strategies

**`routes/export.js` — Async**
- "This endpoint works fine. A customer wants to export 500,000 rows. Walk me through what happens."
- Look for: event loop blocking, job queue pattern (BullMQ/SQS), streaming, polling endpoint

**`routes/admin.js` — RBAC**
- "The product manager says only admins should access these routes. Is that enforced here?"
- The role check is only on the frontend. Look for: server-side enforcement, RBAC abstraction, principle of defence-in-depth

---

### Data Architecture

**Starting prompt:**
> *"Take a look at `schema.sql`. If this app goes live with 10 paying customers and 1 million rows after 6 months, what concerns you?"*

**`schema.sql` — Indexes + Tenancy**
- Let them read. T1: no indexes. T2: no RLS. T3: no partitioning.
- "A developer forgets to add `WHERE org_id = ?` to a query. What happens?"
- Look for: RLS policies, index strategy, multi-tenancy models (shared schema vs schema-per-tenant vs DB-per-tenant), awareness of trade-offs

**`services/reportService.js` — N+1**
- "This service is slow on pages with 100 reports. Can you find the query pattern causing it?"
- After they spot it: "How would you fix it?" Look for: JOIN, `IN` clause, DataLoader pattern
- Follow up (T3): "What happens if `insertReport` succeeds but `insertAuditLog` fails?" Look for: transactions, atomicity

**`cache/redis.js` — Caching**
- "A user edits a report but keeps seeing the old version. Where's the bug?"
- After: "When does a cached key expire?" (never — no TTL)
- T3 follow-up: "Imagine this report is read by thousands of users and the cache key expires. What happens to the database in that moment?" (stampede)

---

### DevSecOps

**Starting prompt:**
> *"Imagine you're doing a security review before this goes live. Walk me through what you'd flag."*

**`config.js`**
- Should be caught immediately. "How should secrets be managed instead?"
- Look for: environment variables, AWS Secrets Manager, Vault, secret rotation

**`ci.yml`**
- "What's missing from this pipeline from a security standpoint?"
- Look for: `npm audit`, Snyk/Dependabot, secret scanning (gitleaks/trufflehog), SAST (Semgrep/CodeQL), image scanning (Trivy)
- T3: "How would you ensure a developer can't accidentally deploy to production by pushing to a feature branch?"

**`store/authStore.js`**
- "What's the security implication of storing the JWT in localStorage?"
- Look for: XSS awareness, HttpOnly cookie alternative, CSRF trade-off when switching to cookies

**`middleware/rateLimit.js`**
- T2: "In the office, users are hitting rate limits even though individually they're not sending many requests. Why?"
- T3: "We scale to 3 server instances. Our rate limits stop working correctly. Why, and how do you fix it?"

---

### Software Architecture

**Starting prompt:**
> *"Looking at the overall structure — if you joined this team, what's the first architectural thing you'd want to fix?"*

**Service layer**
- "The route handlers are doing a lot. How would you restructure this?"
- Look for: controller/service/repository pattern, separation of concerns, testability

**`services/notificationService.js`**
- "A Slack outage is causing report creation to fail. How would you redesign this?"
- Look for: event-driven architecture, message queues (SQS/BullMQ), decoupling, retry with backoff

**`tests/reports.test.js`**
- "We refactored some internals and 30 tests failed, even though the app works fine. What does that tell you?"
- Look for: testing behaviour vs implementation, integration vs unit test distinction, test pyramid awareness

---

### Cloud

**Starting prompt:**
> *"Walk me through the infrastructure. If you had to harden this before a production launch, what would you change?"*

**`infrastructure/security-groups.tf`**
- "What does this security group expose?" Should catch 0.0.0.0/0 on all ports.
- "What's the correct network topology for this app — what should be public-facing and what shouldn't?"
- Look for: public/private subnet distinction, ALB in public, ECS tasks and RDS in private

**`infrastructure/ecs.tf`**
- "What's the IAM policy attached to the app's task role? What's the risk?"
- Look for: least privilege principle, specific permissions (S3:PutObject on specific bucket only)
- "The app crashes silently and traffic keeps routing to it. What's missing?"
- Look for: ECS health check, ALB target group health check, circuit breaker

**`infrastructure/rds.tf`**
- "A compliance auditor asks about data at rest encryption and disaster recovery. What do you tell them?"
- Look for: `storage_encrypted`, `backup_retention_period`, Multi-AZ, read replicas

**Observability (not in a file — a discussion question)**
- "The app goes down at 2am. How do you know, and how do you find the root cause?"
- Look for: CloudWatch alarms, structured logging, distributed tracing (X-Ray), dashboards, on-call runbooks

---

## Phase 4 — Architecture Discussion (7 min)

Pick one of these depending on how the session has gone:

**Option A — Scale**
> *"This app currently serves 5 customers. The CEO just signed a deal that will add 500 more in 3 months. Walk me through what breaks first and how you'd address it."*

**Option B — Security incident**
> *"We get a report that a user was able to access another org's data. Given what you've seen in the codebase, where would you start the investigation?"*

**Option C — Team growth**
> *"You're about to onboard 4 junior developers onto this codebase. What do you put in place in the first two weeks to make sure they can't accidentally break production?"*

These questions have no right answer. You're watching how they synthesise everything they've seen and how they communicate trade-offs.

---

## Scoring Rubric

Score each domain 1–4. Use half-points if needed.

| Score | Meaning |
|---|---|
| 1 | Significant gaps. Misses foundational issues (T1) or can't explain what's wrong. |
| 2 | Foundational issues spotted. Struggles to explain how to fix them or why they matter in production. |
| 3 | Spots T1 and most T2 issues. Clear explanations. Can design a fix. Works independently. |
| 4 | Reaches T3. Thinks in systems — explains trade-offs, failure modes, and cross-cutting impact. Can lead and mentor. |

### Score Sheet

| Domain | Score (1–4) | Notes |
|---|---|---|
| Frontend | | |
| Backend | | |
| Data Architecture | | |
| Software Architecture | | |
| DevSecOps | | |
| Cloud | | |
| **Communication** | | Clarity, trade-off thinking, how they explain to non-engineers |

**Overall signal:**
- Score of 3+ across all domains → strong all-rounder
- Score of 4 in 2–3 domains + 2–3 in others → strong specialist, consider the role fit
- Score of 1–2 across the board → significant gaps, likely needs a more junior role or structured mentorship

---

## What to Watch For (Beyond Scores)

**Green flags**
- Connects issues across files without prompting ("this route has no auth, and I also see the middleware only uses `decode`...")
- Quantifies impact ("this N+1 query fires 101 DB calls for a page of 100 rows")
- Proposes trade-offs, not just solutions ("you could use schema-per-tenant for stronger isolation, but it complicates migrations")
- Asks clarifying questions before redesigning ("how many tenants are we expecting, and what's the data volume?")
- Notices what's missing, not just what's wrong (no tests for rate limiting, no observability, no audit trail on deletes)

**Red flags**
- Misses the hardcoded credentials in `config.js` (T1 — universal signal)
- Spots issues but can't explain the real-world impact
- Immediately proposes rewrites without understanding the existing system
- Can't reason about what they haven't directly seen (e.g. "I only know React, I wouldn't look at the Terraform")
- Talks only in tools and libraries, not in principles

---

## Adapting for Seniority

**Junior (1–3 years):** Focus on T1 issues only. Evaluate whether they can spot obvious problems and explain them clearly. Don't push for T2/T3. Good junior: scores 2–3 on FE and BE.

**Mid-level (3–6 years):** Expect T1 clean and T2 for their primary domain. Should have opinions on architecture. Good mid-level: scores 3 in their domain, 2 elsewhere.

**Senior (6+ years):** Should reach T3 in at least one domain and T2 across the board. Should think in systems, not files. Good senior: scores 3–4 across all domains with depth in 2+.

**Lead/Principal:** T3 across the board. Proactively discusses team impact, process changes (code review gates, CI requirements), and long-term architectural direction, not just individual file fixes.

---

## Note on Tone

This interview works best when it feels like a collaborative code review between peers, not an interrogation. If the candidate misses something, don't correct them immediately — ask a follow-up that points them in the right direction. The goal is to see how they respond to being guided, which is as valuable as whether they spot the issue unprompted.

End with genuine time for their questions. How they use that time (asking about team structure, technical roadmap, how decisions are made) tells you a lot about what they value.
