# 주식 뉴스 기능 구현 진행 상황

**마지막 업데이트:** 2026-05-01
**다음 세션에서 시작할 태스크:** Task 2

---

## 이어서 진행하는 방법

다음 프롬프트를 복사해서 사용:

```
주식 뉴스 기능 구현을 이어서 진행해줘.

진행 상황: docs/superpowers/progress/2026-05-01-stock-news-progress.md
구현 계획: docs/superpowers/plans/2026-05-01-stock-news-feature.md
설계 문서: docs/superpowers/specs/2026-05-01-stock-news-feature-design.md

Task 2부터 시작. Task 1(Prisma 스키마)은 완료됨.
```

---

## 전체 진행률 (1/19 완료)

| # | 태스크 | 상태 | 비고 |
|---|--------|------|------|
| 1 | Prisma 스키마 업데이트 | ✅ 완료 | 커밋: 72ad090 |
| 2 | TypeScript 타입 업데이트 | ⏳ 다음 | packages/types/src/stock.ts |
| 3 | NaverFinanceCrawler 확장 | 대기 | 20개 확장, marketCap 추가 |
| 4 | NaverNewsCrawler 생성 | 대기 | 신규 파일 생성 |
| 5 | StockRepository 확장 | 대기 | CRUD 메서드 추가 |
| 6 | StockService 확장 | 대기 | 뉴스 크롤링 로직 |
| 7 | StockController 확장 | 대기 | API 엔드포인트 |
| 8 | StockModule 업데이트 | 대기 | Provider 등록 |
| 9 | Scheduler 업데이트 | 대기 | 뉴스 스케줄 추가 |
| 10 | shadcn 컴포넌트 추가 | 대기 | slider, dialog, scroll-area |
| 11 | FilterBar 컴포넌트 | 대기 | Range Slider UI |
| 12 | StockNewsDialog 컴포넌트 | 대기 | 종목별 뉴스 팝업 |
| 13 | StockNewsCard 컴포넌트 | 대기 | 전체 뉴스 섹션 |
| 14 | TopTradingValue 컴포넌트 | 대기 | 거래대금 상위 20 |
| 15 | TopVolume 수정 | 대기 | 20개 + 뉴스 Dialog |
| 16 | API 클라이언트 | 대기 | stockApi 메서드 추가 |
| 17 | React Query Hooks | 대기 | useLatestNews 등 |
| 18 | Dashboard 통합 | 대기 | 새 컴포넌트 연결 |
| 19 | 빌드/테스트 | 대기 | 최종 검증 |

---

## 완료된 작업

### Task 1: Prisma 스키마 업데이트 ✅

**커밋:** `72ad090`
**파일:** `apps/api/prisma/schema.prisma`

**완료 내용:**
- `TopVolumeStock` 모델에 `marketCap BigInt` 추가
- `StockMover` 모델에 `marketCap BigInt` 추가
- `TopTradingValueStock` 모델 생성
- `StockNews` 모델 생성

**주의:** DATABASE_URL 미설정으로 마이그레이션 미적용. 실제 사용 전 실행 필요:
```bash
cd apps/api && npx prisma migrate dev --name add_stock_news_and_marketcap
```

---

## 남은 작업 상세

### Task 2: TypeScript 타입 업데이트

**파일:** `packages/types/src/stock.ts`

**해야 할 일:**

1. 기존 `TopVolumeStock` 인터페이스에 `marketCap: number` 추가
2. 기존 `StockMover` 인터페이스에 `marketCap: number` 추가
3. `TopTradingValueStock` 인터페이스 추가:
```typescript
export interface TopTradingValueStock {
  id: string;
  date: string;
  rank: number;
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  tradingValue: number;
  marketCap: number;
  market: MarketType;
  createdAt: Date;
}
```

4. `StockNews` 인터페이스 추가:
```typescript
export interface StockNews {
  id: string;
  date: string;
  stockCode: string;
  stockName: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
}
```

5. `DailyStockSummary`에 필드 추가:
```typescript
topTradingValue: TopTradingValueStock[];
news: StockNews[];
```

6. `StockFilter` 타입 추가:
```typescript
export interface StockFilter {
  mcMin?: number;
  mcMax?: number;
  tvMin?: number;
  tvMax?: number;
}
```

7. 빌드: `cd packages/types && pnpm build`

---

### Task 3: NaverFinanceCrawler 확장

**파일:** `apps/api/src/stock/crawler/naver-finance.crawler.ts`

**해야 할 일:**
1. `CrawledStock` 인터페이스에 `marketCap: bigint` 추가
2. `CrawledTradingValueStock` 인터페이스 추가
3. `crawlTopVolumeStocks()` - 10개 → 20개로 변경, marketCap 크롤링 추가
4. `crawlTopTradingValueStocks()` 메서드 추가 (거래대금 상위)
5. `crawlStockMovers()` - marketCap 크롤링 추가

---

### Task 4: NaverNewsCrawler 생성

**파일:** `apps/api/src/stock/crawler/naver-news.crawler.ts` (신규)

**구현 내용:**
- 네이버 뉴스 검색 크롤링
- `crawlNewsForStock(stockCode, stockName, limit=5)` 메서드
- `crawlNewsForStocks(stocks[], newsPerStock=5)` 메서드
- IP 차단 방지 딜레이 (1초)
- 중복 종목 제거

---

### Task 5-9: 백엔드 나머지

- Repository: TopTradingValueStock, StockNews CRUD
- Service: crawlNews(), getSummary() 확장
- Controller: `/api/stock/news/latest`, `/api/stock/news/:stockCode`
- Module: NaverNewsCrawler 등록
- Scheduler: 16:35 뉴스 크롤링 추가

---

### Task 10-18: 프론트엔드

1. shadcn 컴포넌트 설치:
```bash
cd apps/stock
npx shadcn@latest add slider dialog scroll-area badge separator
```

2. 컴포넌트 생성:
- `filter-bar.tsx` - Range Slider 필터
- `stock-news-dialog.tsx` - 종목 클릭 시 뉴스 팝업
- `stock-news-card.tsx` - 하단 전체 뉴스
- `top-trading-value.tsx` - 거래대금 상위 20

3. 기존 컴포넌트 수정:
- `top-volume.tsx` - 20개 표시, 뉴스 Dialog 연동

4. API/Hooks 추가:
- `lib/api.ts` - getLatestNews, getNewsByStock
- `hooks/use-stock.ts` - useLatestNews, useTriggerNewsCrawl

5. Dashboard 통합:
- `app/page.tsx` - 새 컴포넌트 import 및 배치

---

## 관련 파일 위치

```
docs/
└── superpowers/
    ├── specs/
    │   └── 2026-05-01-stock-news-feature-design.md  # 설계 문서
    ├── plans/
    │   └── 2026-05-01-stock-news-feature.md         # 구현 계획 (상세 코드 포함)
    └── progress/
        └── 2026-05-01-stock-news-progress.md        # 이 파일

apps/
├── api/
│   ├── prisma/schema.prisma                         # ✅ Task 1 완료
│   └── src/stock/
│       ├── crawler/
│       │   ├── naver-finance.crawler.ts             # Task 3
│       │   └── naver-news.crawler.ts                # Task 4 (신규)
│       ├── stock.repository.ts                      # Task 5
│       ├── stock.service.ts                         # Task 6
│       ├── stock.controller.ts                      # Task 7
│       ├── stock.module.ts                          # Task 8
│       └── scheduler/stock-scheduler.service.ts     # Task 9
└── stock/
    └── src/
        ├── components/
        │   ├── ui/                                   # Task 10 (shadcn)
        │   └── dashboard/
        │       ├── filter-bar.tsx                   # Task 11 (신규)
        │       ├── stock-news-dialog.tsx            # Task 12 (신규)
        │       ├── stock-news-card.tsx              # Task 13 (신규)
        │       ├── top-trading-value.tsx            # Task 14 (신규)
        │       └── top-volume.tsx                   # Task 15 (수정)
        ├── lib/api.ts                               # Task 16
        ├── hooks/use-stock.ts                       # Task 17
        └── app/page.tsx                             # Task 18

packages/
└── types/src/stock.ts                               # Task 2
```

---

## Git 커밋 히스토리

```
d074479 docs: add implementation progress tracking
72ad090 feat(api): add TopTradingValueStock, StockNews models and marketCap field  # Task 1
05438fd docs: 주식 뉴스 기능 구현 계획 추가
860868c docs: 필터 UI를 Range Slider로 변경
ddc4ed8 docs: 시가총액/거래대금 필터 기능 추가
0255fea docs: 주식 뉴스 수집 기능 설계 문서 추가
```

---

## 참고: 구현 계획 파일

모든 태스크의 **상세 코드**가 포함된 구현 계획:
`docs/superpowers/plans/2026-05-01-stock-news-feature.md`

이 파일에 각 태스크별로 정확한 코드 스니펫이 있으므로, 다음 세션에서 해당 파일을 참고하면서 진행하면 됨.
