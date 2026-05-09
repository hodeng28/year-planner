# Trading Journal (매매일지) Design Spec

## Overview

개인 주식/ETF 매매를 기록하고 분석하는 매매일지 애플리케이션.
수익률, 패턴, 심리 분석을 통해 트레이딩 실력 향상을 돕는다.

## Scope

### In Scope
- 국내 주식 + ETF 매매 기록
- 완료된 매매만 기록 (건별 기록, 합산 조회)
- 상세 기록: 종목, 가격, 수량, 목표가, 손절가, 감정, 패턴, 전략, 메모
- 종합 대시보드: 수익률 + 패턴 분석 + 심리 분석
- 일별/월별 그룹핑 조회
- 분류 옵션: 기본값 + 커스텀 추가 가능
- 모바일/데스크톱 반응형 UI

### Out of Scope
- 해외 주식 (향후 확장 고려)
- 실시간 포지션 관리 (미결 매매 추적)
- 실시간 시세 연동
- 멀티 유저 지원

## Tech Stack

### Frontend (apps/web)
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- shadcn/ui (다크모드 지원)
- recharts (차트)
- React Query (서버 상태)
- date-fns (날짜 처리)

### Backend (apps/api)
- NestJS
- Prisma ORM
- PostgreSQL

### Tooling
- pnpm workspace
- TypeScript strict mode

## Data Model

### Trade (매매 기록)
```prisma
model Trade {
  id             String          @id @default(uuid())
  stockCode      String          // 종목 코드
  stockName      String          // 종목명
  type           TradeType       // BUY | SELL
  price          Int             // 매매가
  quantity       Int             // 수량
  tradedAt       DateTime        // 매매 일시
  targetPrice    Int?            // 목표가
  stopLossPrice  Int?            // 손절가
  emotionId      String?
  emotion        EmotionOption?  @relation(fields: [emotionId], references: [id])
  patternId      String?
  pattern        PatternOption?  @relation(fields: [patternId], references: [id])
  strategyId     String?
  strategy       StrategyOption? @relation(fields: [strategyId], references: [id])
  memo           String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

enum TradeType {
  BUY
  SELL
}
```

### EmotionOption (감정 옵션)
```prisma
model EmotionOption {
  id        String   @id @default(uuid())
  name      String   @unique
  isDefault Boolean  @default(false)
  trades    Trade[]
  createdAt DateTime @default(now())
}
```
기본값: 침착, 불안, 탐욕, 공포, FOMO

### PatternOption (차트 패턴 옵션)
```prisma
model PatternOption {
  id        String   @id @default(uuid())
  name      String   @unique
  isDefault Boolean  @default(false)
  trades    Trade[]
  createdAt DateTime @default(now())
}
```
기본값: 돌파, 눌림목, 쌍바닥, 역헤드앤숄더, 박스권, 추세선 이탈

### StrategyOption (전략 옵션)
```prisma
model StrategyOption {
  id        String   @id @default(uuid())
  name      String   @unique
  isDefault Boolean  @default(false)
  trades    Trade[]
  createdAt DateTime @default(now())
}
```
기본값: 스윙, 단타, 추세추종, 역추세, 이벤트

## 손익/승률 계산 로직

### 손익 계산
- 같은 종목의 매수/매도를 FIFO(선입선출) 방식으로 페어링
- 매도 금액 - 매수 금액 = 실현 손익
- 예: 삼성전자 100주 매수(70,000원) → 100주 매도(75,000원) = +500,000원

### 승률 계산
- 승: 실현 손익 > 0
- 패: 실현 손익 < 0
- 무승부: 실현 손익 = 0 (승률 계산에서 제외)
- 승률 = 승 / (승 + 패) × 100%

### 평균 손익비
- 평균 수익 = 총 수익 / 수익 거래 수
- 평균 손실 = 총 손실 / 손실 거래 수
- 손익비 = 평균 수익 / |평균 손실|

### 미페어링 매매
- 매수만 있고 매도가 없는 경우: 미실현 (계산에서 제외)
- 매도만 있고 매수가 없는 경우: 이전 보유분으로 간주, 손익 계산 불가

## Page Structure

### / (대시보드)
- 기간 토글: 일 | 주 | 월 | 연
- 총 수익/손실 KPI 카드
- 기간별 수익 차트 (recharts BarChart)
- 승률/평균손익비 카드
- 감정별 승률 차트 (PieChart)
- 최근 매매 리스트 (5건)

### /trades (매매 기록)
- 뷰 모드: 리스트 | 캘린더
- 그룹핑: 일별 | 월별 (Collapsible)
  - 각 그룹에 일일/월별 손익 합계 표시
- 필터: 기간, 종목, 매수/매도
- + 새 매매 추가 버튼 → Dialog (TradeForm)

### /analysis (분석)
- 종목별 수익 분석
- 패턴별 승률
- 전략별 성과
- 감정 vs 결과 상관관계

### /settings (설정)
- 감정 옵션 관리 (추가/삭제)
- 패턴 옵션 관리 (추가/삭제)
- 전략 옵션 관리 (추가/삭제)

## API Endpoints

### 매매 기록 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trades | 매매 목록 조회 (필터, 페이징) |
| GET | /api/trades/:id | 매매 상세 조회 |
| POST | /api/trades | 매매 등록 |
| PUT | /api/trades/:id | 매매 수정 |
| DELETE | /api/trades/:id | 매매 삭제 |

### 통계/분석 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stats/summary | 총 수익, 승률, 거래 수 |
| GET | /api/stats/daily | 일별 손익 |
| GET | /api/stats/monthly | 월별 손익 |
| GET | /api/stats/by-stock | 종목별 손익 |
| GET | /api/stats/by-emotion | 감정별 승률 |
| GET | /api/stats/by-pattern | 패턴별 승률 |
| GET | /api/stats/by-strategy | 전략별 승률 |

### 옵션 관리 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/options/emotions | 감정 옵션 목록 |
| POST | /api/options/emotions | 감정 옵션 추가 |
| DELETE | /api/options/emotions/:id | 감정 옵션 삭제 |
| GET | /api/options/patterns | 패턴 옵션 목록 |
| POST | /api/options/patterns | 패턴 옵션 추가 |
| DELETE | /api/options/patterns/:id | 패턴 옵션 삭제 |
| GET | /api/options/strategies | 전략 옵션 목록 |
| POST | /api/options/strategies | 전략 옵션 추가 |
| DELETE | /api/options/strategies/:id | 전략 옵션 삭제 |

## Project Structure

```
apps/
├── web/                    # Next.js 프론트엔드
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # 대시보드
│       │   ├── trades/page.tsx    # 매매 기록
│       │   ├── analysis/page.tsx  # 분석
│       │   └── settings/page.tsx  # 설정
│       ├── components/
│       │   ├── ui/               # shadcn 컴포넌트
│       │   ├── dashboard/        # 대시보드 컴포넌트
│       │   ├── trades/           # 매매 관련 컴포넌트
│       │   └── layout/           # 헤더, 네비게이션
│       ├── hooks/                # React Query 훅
│       └── lib/                  # 유틸리티
│
├── api/                    # NestJS 백엔드
│   └── src/
│       ├── trades/         # 매매 모듈
│       ├── stats/          # 통계 모듈
│       ├── options/        # 옵션 관리 모듈
│       └── prisma/         # Prisma 스키마
│
packages/
├── types/                  # 공유 타입
└── config/                 # 공유 설정
```

## UI Components (shadcn/ui)

### 사용할 컴포넌트
- Card: KPI 카드, 통계 카드
- Button: 액션 버튼
- Input: 텍스트 입력
- Select: 드롭다운 선택
- Dialog: 매매 입력 폼
- Table: 매매 목록
- Tabs: 뷰 전환
- Collapsible: 일별/월별 접이식
- Calendar: 캘린더 뷰
- Badge: 상태 표시

### 테마
- 다크모드 기본 지원
- 모바일: 하단 네비게이션 바
- 데스크톱: 사이드바 또는 상단 네비게이션

## Migration Plan

1. 기존 코드 삭제
   - apps/stock 삭제
   - apps/income 관련 파일 삭제
   - apps/api 내 기존 모듈 삭제
   - packages/types 정리

2. 새 프로젝트 설정
   - apps/web 생성 (Next.js)
   - apps/api 리셋 (NestJS)
   - Prisma 스키마 재작성
   - shadcn/ui 설치 및 설정

3. 기능 구현 순서
   - Phase 1: 프로젝트 세팅 + DB 스키마
   - Phase 2: 매매 CRUD
   - Phase 3: 대시보드
   - Phase 4: 분석 페이지
   - Phase 5: 설정 페이지
