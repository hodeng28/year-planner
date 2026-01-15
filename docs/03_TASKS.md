# Task Queue (Vibe Coding)

## Input Format
- New tasks
- Priority changes
- Completion status

## Output Format (MUST)
1) Current Sprint Goal
2) Priority Order
3) Task details (Requirements, DoD, Files)

---

## Current Sprint Goal
Build MVP CRUD for Goal + Task with validation and minimal UI.

## Priority Order
1) API: Goal CRUD
2) Web: Goal UI (list + create)
3) API: Task CRUD + status change
4) Web: Today's Tasks UI
5) Stats endpoint + UI

---

## Task 1: Goal CRUD (API)
### Requirements
- Implement POST/GET/GET:id/PATCH/DELETE for /goals
- Validate DTOs using class-validator
- Use in-memory storage temporarily if DB not ready (but keep a repository interface)

### Definition of Done
- All endpoints working
- Unit test OR e2e test for create + list
- `pnpm lint && pnpm type-check` pass

### Files To Touch (suggested)
- apps/api/src/goals/goals.module.ts
- apps/api/src/goals/goals.controller.ts
- apps/api/src/goals/goals.service.ts
- apps/api/src/goals/dto/create-goal.dto.ts
- apps/api/src/goals/dto/update-goal.dto.ts
