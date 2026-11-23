# Set A · TeamMetrics (TypeScript edition)

Technical interview set for the Software Engineering skills: a realistic, intentionally flawed **TypeScript** web app. Interviewer-facing. See `interviewer/INTERVIEW_GUIDE.md` first.

**Theme:** a multi-tenant analytics dashboard: authorisation and tenant isolation, caching, notifications on the critical path, performance and delivery. This is the original Set A modernised to TypeScript with every original flaw kept, plus accessibility, observability, validation and more tests. The previous JavaScript version is preserved in git history (tags `js-final-main` and `js-final-interviewer-copy`).

## Layout

| Path | Share with the engineer? |
|---|---|
| `app/` the codebase to review (clean, no hints) | **Yes** (`npm run package:candidate`) |
| `interviewer/INTERVIEW_GUIDE.md` how to run the session | No |
| `interviewer/flaws.yaml` the answer key (83 flaws, tiered, with probes, strong answers, growth pointers) | No |
| `interviewer/PROBES.md` printable probe sheet, generated from the key | No |
| `interviewer/proofs/` tests proving flaws are real (pass while the flaw exists) | No |
| `interviewer/SCORESHEET.md`, `MEMO_TEMPLATE.md` | No |

## Commands

```bash
npm install                 # tooling for the checks (yaml)
npm run check               # answer key still matches the code; prints coverage
npm run proofs              # installs app deps if needed, runs the proof tests
npm run probes              # regenerate interviewer/PROBES.md from flaws.yaml
npm run package:candidate   # dist/swe-interview-set-A-candidate.zip (app/ only)
cd app && npm test          # the app's own tests (these should be green)
```

## Coverage

| Skill | T1 | T2 | T3 | Total |
|---|---|---|---|---|
| Frontend | 4 | 8 | 2 | 14 |
| Backend | 6 | 8 | 2 | 16 |
| Cloud Application | 6 | 5 | 2 | 13 |
| Software Architecture | 3 | 4 | 2 | 9 |
| Data Architecture | 3 | 9 | 3 | 15 |
| DevSecOps | 6 | 5 | 5 | 16 |

Lenses covered: security, correctness, data integrity, reliability, performance, quality, delivery, maintainability, accessibility, observability. Run `npm run check` for the current numbers.

## What was verified

- `app/`: typecheck clean, 21 tests passing.
- `interviewer/proofs/`: 13 proofs pass, one per demonstrable flaw.
- `flaws.yaml`: every anchor exists in the code.
- **Not verified:** Terraform (`infra/main.tf`) and the GitHub workflow were written by hand and not executed. Dockerfile not built.

## Known intentional properties of the app

- Test suite is green. That is deliberate: the interesting question is why the product is still broken (see guide, "Green tests, broken product").
- It runs on an embedded Postgres (PGlite) for zero setup; treat it as Postgres 16.
