# Engineering Standards

## Input Format
- Code style questions
- Naming conflicts
- Testing requirements

## Output Format (MUST)
1) Naming conventions
2) Type Safety rules
3) Testing standards
4) Commit Style

---

## Naming
- File: kebab-case
- DTO: CreateGoalDto / UpdateGoalDto
- Service: goal.service.ts
- Controller: goal.controller.ts
- Route prefix: /goals, /tasks ...

## Type Safety
- No `any`
- DTO validated at boundary
- Shared types from packages/types only

## Testing (MVP minimal)
- API: at least 1 e2e per resource or 1 happy-path per module
- Web: at least type-check + lint

## Commit Style
- feat: ...
- fix: ...
- chore: ...
