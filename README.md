# Year Planner 📅

**1년 계획 관리 시스템** - 목표/분기/월간 계획 + 오늘 할 일 + 회고를 통합 관리하는 애플리케이션

## 🎯 프로젝트 개요

Year Planner는 연간 목표를 설정하고, 분기/월간/주간 단위로 계획을 수립하며, 일일 태스크를 관리하고 회고를 기록할 수 있는 통합 플래너 시스템입니다.

### 핵심 엔티티

- **Goal**: 연간 목표
- **Plan**: 분기/월간/주간 계획
- **Task**: 할 일 태스크 (투두)
- **Review**: 회고 기록

## 🏗️ 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS 11, TypeScript
- **Package Manager**: pnpm (workspace)
- **Architecture**: Monorepo 구조

## 📁 프로젝트 구조

```
year-planner/
├── apps/
│   ├── web/        # Next.js Frontend
│   └── api/        # NestJS Backend
├── packages/
│   ├── types/      # 공용 TypeScript 타입 정의
│   └── config/     # 공용 설정 (tsconfig, eslint 등)
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 🚀 시작하기

### 사전 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 설치

```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 프론트엔드와 백엔드 동시 실행
pnpm dev

# 또는 개별 실행
pnpm dev:web    # Next.js 개발 서버 (기본: http://localhost:3000)
pnpm dev:api    # NestJS 개발 서버 (기본: http://localhost:3000)
```

### 빌드

```bash
# 전체 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트
pnpm lint
```

## 📋 주요 기능 (MVP)

### 완료된 기능
- ✅ Monorepo 구조 설정
- ✅ Next.js + NestJS 기본 구조
- ✅ 공용 타입 정의 (Goal, Plan, Task, Review)

### 예정된 기능
- [ ] 목표(Goal) CRUD
- [ ] 태스크(Task) CRUD + 상태 변경 (진행/완료/보류)
- [ ] 일정(Plan) CRUD
- [ ] 월별 통계 (완료율)
- [ ] JWT 인증
- [ ] Guard 기반 권한 관리
- [ ] Cron 스케줄러 (일정 알림)

## 🏛️ 아키텍처 특징

### NestJS 포인트

- **Controller → Service → DTO/ValidationPipe** 구조
- **Guard**: JWT 인증 + 역할(Role) 기반 접근 제어
- **Cron**: 스케줄러를 통한 일정 알림 기능

### Next.js 포인트

- **App Router** 기반 최신 구조
- **Server Components & Client Components** 최적 활용
- **타입 안전성**: 공용 타입 패키지로 프론트엔드-백엔드 타입 일관성 유지

## 📝 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 프론트엔드 + 백엔드 동시 개발 모드 실행 |
| `pnpm dev:web` | Next.js 개발 서버만 실행 |
| `pnpm dev:api` | NestJS 개발 서버만 실행 |
| `pnpm build` | 전체 프로젝트 빌드 |
| `pnpm lint` | 전체 프로젝트 린트 검사 |
| `pnpm type-check` | 전체 프로젝트 타입 체크 |



