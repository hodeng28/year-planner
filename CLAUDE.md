# Trading Journal Project

주식 매매일지 프로젝트입니다.

## Quick Reference

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui
- **Backend**: NestJS + Prisma + PostgreSQL
- **Charts**: recharts
- **Tooling**: pnpm workspace, React Query, date-fns

## Key Rules

1. **Dashboard-first** - 대시보드 중심 UI, 복잡한 네비게이션 금지
2. **Mobile-first** - 모바일 우선 반응형 디자인
3. **No over-engineering** - 요청받은 것만 구현
4. **Tech stack 고정** - shadcn/ui, recharts, NestJS, Prisma 필수 사용

## Project Structure

```
apps/
  web/        # Frontend (Next.js)
  api/        # Backend (NestJS)
packages/
  types/      # Shared types
  config/     # Shared config
```

## Trade Categories

### Emotion (감정)
- `confident` - 확신
- `anxious` - 불안
- `impulsive` - 충동적
- `calm` - 침착

### Pattern (패턴)
- `breakout` - 돌파
- `pullback` - 눌림목
- `reversal` - 반전
- `trend` - 추세

### Strategy (전략)
- `swing` - 스윙
- `daytrading` - 데이트레이딩
- `position` - 포지션
- `scalping` - 스캘핑

## API Endpoints

### Trades
- `GET /api/trades` - 매매 기록 조회
- `POST /api/trades` - 매매 기록 생성
- `PUT /api/trades/:id` - 매매 기록 수정
- `DELETE /api/trades/:id` - 매매 기록 삭제

### Statistics
- `GET /api/stats` - 통계 조회
- `GET /api/stats/summary` - 요약 통계
- `GET /api/stats/by-emotion` - 감정별 통계
- `GET /api/stats/by-pattern` - 패턴별 통계
- `GET /api/stats/by-strategy` - 전략별 통계

### Options
- `GET /api/options/emotions` - 감정 옵션 목록
- `GET /api/options/patterns` - 패턴 옵션 목록
- `GET /api/options/strategies` - 전략 옵션 목록
