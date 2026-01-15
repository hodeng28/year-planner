# Architecture

## Input Format
- Architecture decisions
- Layer rules
- Dependency changes

## Output Format (MUST)
1) Monorepo Structure
2) Backend Layer Rules
3) Frontend Rules
4) Shared Types Rule

---

## Monorepo Structure (pnpm workspace)
- apps/web: Next.js 16 App Router
- apps/api: NestJS 11
- packages/types: shared TypeScript types
- packages/config: shared config (tsconfig/eslint)

## Backend Layer Rules (NestJS)
- Controllers: routing only, no business logic
- Services: business logic + orchestration
- DTO: request validation (class-validator) + ValidationPipe global
- Repository/DB layer: (TBD - choose Prisma later)
- Error handling: unified error response format

## Frontend Rules (Next.js App Router)
- Default Server Components
- Use Client Components only when needed (forms, interaction)
- API calls: fetch wrapper (TBD)
- UI: Tailwind + shadcn/ui style

## Shared Types Rule
- Front & API must import domain types from packages/types
- No duplicated interfaces inside apps
