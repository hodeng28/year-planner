# Year Planner - Context

## Input Format
- Product requirements
- Domain questions
- Scope changes

## Output Format (MUST)
1) Product Vision (updated)
2) Domain Terms (glossary)
3) MVP Scope (In/Out)
4) Non-goals

---

## Product Vision
- One place to manage: yearly goals → quarterly/monthly/weekly plans → daily tasks → reviews.
- MVP focuses on: Goal/Task/Plan/Review CRUD + monthly completion stats.
- Later: JWT auth, RBAC, Cron reminders.

## Domain Terms
- Goal: yearly objective (e.g., "Lose 15kg by Dec")
- Plan: time-bounded plan (Quarter/Month/Week)
- Task: actionable todo (status changes)
- Review: reflection log (daily/weekly/monthly)

## MVP Scope (In/Out)
### In
- CRUD: Goal, Task, Plan, Review
- Task status workflow
- Basic monthly stats (completion rate)

### Out (for MVP)
- Social features, sharing, payments, multi-tenant org

## Non-goals
- No complex calendar integrations for MVP
- No real-time collaboration
