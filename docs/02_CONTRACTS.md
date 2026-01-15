# Contracts

## Input Format
- API design decisions
- Type definitions
- Validation rules

## Output Format (MUST)
1) Status values (enums)
2) API Response Format (Success/Error)
3) Endpoints (method + path)
4) Validation Rules

---

## Task Status
- TODO | IN_PROGRESS | DONE | HOLD

## API Response Format
### Success
```json
{
  "data": ...
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | NOT_FOUND | ...",
    "message": "human readable",
    "details": [...]
  }
}
```

## Endpoints (MVP)
### Goal
- POST /goals
- GET /goals
- GET /goals/:id
- PATCH /goals/:id
- DELETE /goals/:id

### Task
- POST /tasks
- GET /tasks?date=YYYY-MM-DD
- PATCH /tasks/:id (including status change)
- DELETE /tasks/:id

### Plan
- CRUD + filter by period type (QUARTER|MONTH|WEEK)

### Review
- POST /reviews
- GET /reviews?type=daily|weekly|monthly&date=...

## Validation Rules (MVP)
- Goal.title: required, max 60
- Task.title: required, max 80
- Task.dueDate: optional (YYYY-MM-DD)
- Review.content: required, max 2000
