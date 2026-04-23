# Income Dashboard Project

개인 부수입 관리 대시보드 프로젝트입니다.

## Quick Reference

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui
- **Backend**: NestJS + Prisma + PostgreSQL
- **Charts**: recharts
- **Tooling**: pnpm workspace, React Query, date-fns

## Project Docs

@.claude/00_CONTEXT.md
@.claude/01_ARCHITECTURE.md
@.claude/02_CONTRACTS.md
@.claude/03_TASKS.md
@.claude/04_STANDARDS.md
@.claude/05_CHECKLIST.md

## Agent Instructions

@.claude/agents/income.agent.md

## Key Rules

1. **Dashboard-first** - 대시보드 중심 UI, 복잡한 네비게이션 금지
2. **Mobile-first** - 모바일 우선 반응형 디자인
3. **No over-engineering** - 요청받은 것만 구현
4. **Tech stack 고정** - shadcn/ui, recharts, NestJS, Prisma 필수 사용

## Project Structure

```
apps/
  income/     # Frontend (Next.js)
  api/        # Backend (NestJS)
packages/
  types/      # Shared types
  config/     # Shared config
```

## Income Categories

- `event` - 이벤트/경품
- `survey` - 설문/좌담회
- `experience` - 체험단/리뷰

## API Endpoints

- `GET /api/income` - 전체 조회
- `POST /api/income` - 생성
- `PUT /api/income/:id` - 수정
- `DELETE /api/income/:id` - 삭제
