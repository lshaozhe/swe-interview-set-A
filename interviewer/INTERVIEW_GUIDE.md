# TeamMetrics · Technical Interview Guide (Set A (TypeScript edition))

**Interviewer only. Never share this folder with the engineer.** Share `app/` (or run `npm run package:candidate`).

## 1. What this interview is for

A one-on-one technical conversation to see where an engineer stands across the six Software Engineering skills, so we can guide their growth and see where the cohort needs support. It is **not** a ranking or a performance review. The levels you record are **indicative**; any formal level is validated elsewhere.

Principles that shape everything below:

1. **Abilities, not knowledge.** "Can name a load balancer" is not evidence. "Can explain why *this* system needs one and what breaks without it" is.
2. **Ask "why" and "what breaks" about their own work first.** Tool names are easy; reasoning about a system they built is the quickest test of ability.
3. **Candidate-led.** What they notice first, how deep they go unprompted, and how they respond to a nudge tell you more than a checklist hit.
4. **A conversation between peers.** Do not correct immediately; ask a question that points the way. How they respond to guidance is evidence too.
5. **Fundamentals matter more with AI.** Engineers stay accountable for code whoever wrote it. Include the AI-review exercise (section 6) when time allows.

## 2. What is in this repo

| Path | What | Who sees it |
|---|---|---|
| `app/` | The codebase to review: a TypeScript multi-tenant analytics dashboard: reports, exports, an admin area, a cache and notifications (React 19, Express 4, embedded Postgres, axios, TanStack Query). This is the original Set A modernised, with every original flaw kept. It has **no hints in it**. | Engineer |
| `interviewer/flaws.yaml` | The answer key: every planted flaw with file, tier, probe, strong answer and growth pointer. | You |
| `interviewer/PROBES.md` | Print-friendly probe sheet generated from the key. | You |
| `interviewer/proofs/` | Tests that **pass while a flaw exists**, proving it is real. They fail once someone fixes it. | You |
| `interviewer/SCORESHEET.md` | Indicative-level guide and note-taking sheet. | You |
| `interviewer/MEMO_TEMPLATE.md` | Write-up to give back to the engineer. | You |

Commands (from this folder): `npm run check` (answer key still matches the code), `npm run proofs`, `npm run package:candidate`.

## 3. Before the session

- Decide the purpose out loud with your co-interviewer: gauging standing and guiding growth, not selecting.
- Either send `app/` **24 hours ahead** (tests async reading and prioritisation) or give **10 minutes of silent exploration** at the start (tests live instincts). Say which you chose in your notes.
- Ask the engineer to **bring one system they own or have worked on** (a diagram or just their memory is fine). You will use it in the warm-up.
- Have `PROBES.md` open but out of sight. Do not read from it.
- One person asks, one person writes notes. Record observations, not adjectives.

## 4. Session plan (75 minutes)

| Phase | Min | What you are doing |
|---|---|---|
| Welcome and stance | 5 | Say what this is and is not. Remind them to think aloud. |
| Own-system warm-up | 10 | "Walk me through a system you work on. Why is it shaped like that? What breaks if I remove X?" Pick two components and ask *why is it there* and *what would break without it*. |
| Open exploration | 10 | They read the repo. You stay quiet and note where they start, what they open first, whether they look at tests, infra and CI. Then: "What have you found so far?" |
| Guided deep-dives | 30 | 3 to 4 skills (see section 5). Depth beats breadth. |
| AI-review exercise (optional) | 10 | Section 6. Swap for a deep-dive if short on time. |
| Closing | 10 | "Where do you want to grow?" and their questions. How they use this time tells you what they value. |

**The ladder for every probe.** Open prompt → "what else?" → "why does it matter in production?" → "how would you fix it, and how would you prove the fix?" → "what breaks if…?". Where they stop climbing is your evidence for the tier. Stop when you have it. Do not interrogate.

## 5. Choosing deep-dives

- Always include **their primary skill** and **one they are less sure of**. Look for how they reason when out of their depth, not whether they know the answer.
- Early-career engineers: **core build skills first (frontend, backend, data architecture)**. Treat DevSecOps and architecture as bonus signal, not a gap.
- Use `PROBES.md` by skill. The starter prompts below open each area without giving anything away:

| Skill | Starter prompt |
|---|---|
| Frontend | "Open the dashboard and the profile page. What do you notice about how they behave in the browser, and what would a screen-reader user experience?" |
| Backend | "Walk me through a request to GET /api/reports and to the admin endpoints. Who is allowed to do what, and where is that decided?" |
| Data Architecture | "The reports table reaches 50 million rows and one tenant complains about stale numbers. What concerns you about the data layer?" |
| Software Architecture | "Looking at the structure of the server, the client and the tests, what is the first thing you would change?" |
| Cloud Application Engineering | "Walk me through the Terraform and the compose file. What would you harden before launch?" |
| DevSecOps | "You are doing the security review before go-live. What do you flag, in what order, and what would you automate?" |

## 5b. Cross-file chains (the best signal)

Engineers who connect issues across files are showing S3 thinking. If they notice one end of a chain, ask what it combines with.

- **Everyone is an admin:** SA-02 (route guard is client-side) + BE-12 (no role check on the server) + BE-10 (no authorisation layer) + BE-05 (tokens are not verified) + DSO-02 (token in localStorage). Ask: *"How would a member of one organisation delete a user in another, and where would you add the first control?"*
- **Tenant leak:** BE-03 (reports need no token) + DA-01 (SQL injection) + BE-14 (export takes orgId from the body) + DA-04 (no row-level security) + DA-11 (all users returned). Ask: *"List every way one tenant can read another's data."*
- **Create report, partial failure:** SA-06 (notifications on the critical path) + DA-10 (no transaction) + BE-02 (unhandled rejections) + BE-07 (no error handler). Ask: *"Slack is down. Walk me through what the user sees, what is in the database and what the process does."*
- **Stale and slow:** DA-06 (no invalidation) + DA-07 (stampede) + DA-09 (N+1) + DA-02/DA-03 (no limit, no index) + FE-09 (stale filters). Ask: *"A manager says the dashboard is slow and wrong. Where do you look first, second and third?"*
- **Open door to the database:** CL-05 (all ports) + CL-06 (database open to the internet) + CL-07 (not encrypted) + CL-10/DSO-16 (secrets in plain text) + CL-01 (admin role). Ask: *"If someone finds the database password in the repo, what can they do from the internet?"*
- **Green tests, broken product:** SA-07 + SA-08 + DSO-07 + DSO-09. Ask: *"All tests pass. Why might the product still be broken?"*

## 5c. Closing discussion (pick one, 7 to 10 minutes)

- **Scale:** *"We go from 3 customers to 300 and from 1,000 reports to 50 million. What breaks first and how do you find out before customers do?"*
- **Security incident:** *"A customer says they saw another company's data. Where do you start, and what do you do in the first hour?"*
- **Team growth:** *"Four junior developers join next week. What do you put in place in two weeks so they cannot hurt production?"*
- **Modernisation:** *"We want this on a managed platform with proper deploys. What is your order of work?"*

## 6. AI-review exercise (optional, 10 minutes)

*"An AI agent produced this change and the tests pass. Review it as if a teammate sent it."*

Hand over this diff (it adds "role checks"; the agent's own summary says *"Added role-based access control to the admin routes. Tests pass."*):

```ts
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.body?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  next()
}

router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  await db.deleteUser(req.params.id)
  res.json({ success: true })
})
```

Strong reviewers notice: the role is read from the request body, which the caller controls, instead of from a verified token or the database; authenticate still uses jwt.decode, so the token itself cannot be trusted either; it is applied to one route only, so list users, audit log and org creation remain open; there is no org scoping (an admin of one org can delete users in another); there is no audit of who deleted what; and the tests only exercise the happy path with a hand-built body. They propose a central policy layer with deny by default, roles from verified claims, tenant checks, and negative tests for each route.

What to look for: do they read behaviour, not lines; do they ask what would prove it works; do they notice what the tests do not cover; would they merge it, and under what conditions. Strong engineers specify how they would verify it, not just what looks wrong.

## 7. Scoring

Record **one indicative level per skill**, plus Communication. Use `SCORESHEET.md`. In short:

| Level | Evidence |
|---|---|
| Below S1 | Misses most T1 issues, or spots them but cannot explain the impact. |
| **S1** | Spots most T1 issues in the skill and explains why they matter. Needs direction to fix. |
| **S2** | T1 clean and most T2 in the skill. Designs a fix, explains why and what breaks in production, and says how they would prove it. Works independently. |
| **S3** | Reaches T3: failure modes, trade-offs, cross-cutting impact. Can teach it back. |

Evidence over feel: each level needs a sentence of **what we saw** in observable terms, and each skill gets a **"to move up"** pointer taken from the `grow` field of the flaws they stumbled on. Do not average skills into one score.

**Red flags worth noting (as observations, not verdicts):** cannot reason about things they have not seen; proposes a rewrite before understanding the system; lists tools rather than principles; spots issues but cannot say what they cost in production.

**Green flags:** quantifies impact ("that is 101 queries for a page of 100"); proposes trade-offs, not only fixes; asks clarifying questions before redesigning; notices what is **missing** (no tests for money movement, no alarms, no audit trail); can explain AI-generated code without the AI.

## 8. After the session

1. Within 24 hours, fill in `MEMO_TEMPLATE.md` for the engineer. Three focus areas maximum; each must be something they can do in the next two weeks.
2. Record one row per skill per engineer in the team's score sheet so the cohort view is a formula, not a re-read of memos.
3. Note anything that suggests the **question** was unfair (everyone misses it, or it hinges on one library) and tell the maintainer. Adjust the key, not the person.
