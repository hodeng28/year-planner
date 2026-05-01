# 주식 뉴스 수집 기능 설계

## 개요

한국 주식 시장의 일일 데이터를 수집하고, 주요 종목의 관련 뉴스를 자동으로 수집하여 대시보드에 표시하는 기능.

## 요구사항

| 항목 | 내용 |
|------|------|
| 분석 대상 | 거래량 상위 20, 거래대금 상위 20, 급등 종목 상위 10, 주도섹터 상위 3개 내 대장주 각 3개 |
| 뉴스 소스 | 네이버 뉴스 |
| AI 요약 | 없음 (제목/링크만 수집) |
| 증권사 API | 현재 불필요, 추후 필요시 추가 |
| 수집 시점 | 자동 (장 마감 후 16:30~17:00) + 수동 버튼 |
| 뉴스 표시 | 종목별 뉴스 (Dialog) + 전체 뉴스 섹션 |
| 종목당 뉴스 | 5개 |

## 구현 방식

- 뉴스 전용 크롤러 분리 (`NaverNewsCrawler`)
- 스케줄러에서 시세 크롤링 후 뉴스 크롤링 순차 실행
- 뉴스 수집 실패해도 시세 데이터에 영향 없음

---

## 백엔드 구조

### 파일 구조

```
apps/api/src/stock/
├── crawler/
│   ├── naver-finance.crawler.ts  (기존 - 거래량 20으로 확장)
│   └── naver-news.crawler.ts     (신규 - 뉴스 크롤링)
├── scheduler/
│   └── stock-scheduler.service.ts (수정 - 뉴스 크롤링 추가)
├── stock.service.ts              (수정 - 뉴스 조회 메서드 추가)
├── stock.repository.ts           (수정 - 뉴스 저장/조회)
└── stock.controller.ts           (수정 - 뉴스 API 엔드포인트)
```

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/stock/news/latest` | 최신 전체 뉴스 |
| GET | `/api/stock/news/:stockCode` | 종목별 뉴스 |

### 필터 쿼리 파라미터

기존 API에 필터 파라미터 추가:

```
GET /api/stock/summary/latest?mcMin=5000&mcMax=100000&tvMin=100&tvMax=1000
GET /api/stock/top-volume?mcMin=5000
GET /api/stock/movers?mcMin=10000
```

| 파라미터 | 단위 | 설명 |
|----------|------|------|
| mcMin | 억원 | 시가총액 최소값 |
| mcMax | 억원 | 시가총액 최대값 |
| tvMin | 억원 | 거래대금 최소값 |
| tvMax | 억원 | 거래대금 최대값 |

### 스케줄러 동작

```
16:30 시세 크롤링 (기존)
   ↓
16:35 뉴스 크롤링 (신규) - 수집된 종목 기준
```

---

## 데이터 모델

### Prisma Schema

```prisma
// 거래대금 상위 종목 (신규)
model TopTradingValueStock {
  id           String     @id @default(cuid())
  date         String     // YYYY-MM-DD
  rank         Int        // 순위 (1-20)
  stockCode    String     // 종목 코드
  stockName    String     // 종목명
  closePrice   Int        // 종가
  change       Int        // 전일대비
  changePercent Float     // 등락률 (%)
  tradingValue BigInt     // 거래대금 (백만원)
  marketCap    BigInt     // 시가총액 (원)
  market       MarketType
  createdAt    DateTime   @default(now())

  @@unique([date, market, rank])
  @@index([date])
}

// 기존 TopVolumeStock, StockMover 모델에도 marketCap 필드 추가 필요

// 주식 뉴스 (신규)
model StockNews {
  id          String   @id @default(cuid())
  date        String   // YYYY-MM-DD
  stockCode   String   // 종목 코드
  stockName   String   // 종목명
  title       String   // 뉴스 제목
  url         String   // 뉴스 링크
  source      String   // 출처 (예: 한경, 매경)
  publishedAt DateTime // 뉴스 발행 시간
  createdAt   DateTime @default(now())

  @@unique([date, stockCode, url])
  @@index([date])
  @@index([stockCode])
}
```

### TypeScript 타입 (packages/types)

```typescript
// 거래대금 상위 종목 (신규)
export interface TopTradingValueStock {
  id: string;
  date: string;
  rank: number;
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  tradingValue: number; // 거래대금 (백만원)
  marketCap: number;    // 시가총액 (원)
  market: MarketType;
  createdAt: Date;
}

// 기존 TopVolumeStock, StockMover 타입에도 marketCap 필드 추가

// 주식 뉴스 (신규)
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

### DailySummary 확장

```typescript
export interface DailyStockSummary {
  date: string;
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  topVolume: TopVolumeStock[];           // 10 → 20으로 확장
  topTradingValue: TopTradingValueStock[]; // 신규 - 거래대금 상위 20
  gainers: StockMover[];
  losers: StockMover[];
  investorTrading: InvestorTrading[];
  news: StockNews[];                     // 신규 - 관련 뉴스
}
```

---

## 필터 기능

### 시가총액 필터 (Range Slider)

| 구간 | 값 |
|------|-----|
| 최소값 | 0 (제한 없음) |
| 최대값 | 50조+ |
| 주요 눈금 | 1천억, 5천억, 1조, 5조, 10조, 50조 |

### 거래대금 필터 (Range Slider)

| 구간 | 값 |
|------|-----|
| 최소값 | 0 (제한 없음) |
| 최대값 | 5000억+ |
| 주요 눈금 | 50억, 100억, 500억, 1000억, 5000억 |

### 필터 적용 대상

- 거래량 상위 20
- 거래대금 상위 20
- 급등/급락 종목
- 뉴스 수집 대상 종목

### 필터 UI

shadcn/ui `Slider` 컴포넌트 사용. 쇼핑몰 가격 필터 스타일의 Range Slider:

```
┌───────────────────────────────────────────────────────────┐
│ 시가총액                                                  │
│ 0 ────●━━━━━━━━━━━━━━━━━━━━●──── 50조+                    │
│       5천억              10조                             │
│                                                           │
│ 거래대금                                                  │
│ 0 ────────●━━━━━━━━━━━━━━━━━━━━━●── 5000억+               │
│          100억                1000억                      │
│                                                    [적용] │
└───────────────────────────────────────────────────────────┘
```

**슬라이더 특징:**
- 양쪽 핸들로 최소/최대값 조절 (Dual Range Slider)
- 드래그 중 현재 값 툴팁 표시
- 로그 스케일 적용 (작은 값 구간 더 세밀하게)
- 모바일에서도 터치로 조작 가능

### 필터 상태 관리

- URL query parameter로 저장 (새로고침 유지)
- 예: `?mcMin=5000&mcMax=100000&tvMin=100&tvMax=1000`
  - `mcMin/mcMax`: 시가총액 최소/최대 (억원 단위)
  - `tvMin/tvMax`: 거래대금 최소/최대 (억원 단위)

---

## 프론트엔드 UI

### 컴포넌트 구조

```
apps/stock/src/components/
├── dashboard/
│   ├── filter-bar.tsx            (신규 - 시가총액/거래대금 필터)
│   ├── top-volume.tsx            (수정 - 20개로 확장 + 필터 적용)
│   ├── top-trading-value.tsx     (신규 - 거래대금 상위 20)
│   ├── stock-news-card.tsx       (신규 - 전체 뉴스 섹션)
│   └── stock-news-dialog.tsx     (신규 - 종목별 뉴스 팝업)
```

### 전체 뉴스 섹션 (stock-news-card.tsx)

대시보드 하단에 배치. shadcn/ui 컴포넌트 사용:
- `Card`, `CardHeader`, `CardContent`
- `ScrollArea` (뉴스 목록 스크롤)
- `Badge` (출처 표시)

### 종목별 뉴스 팝업 (stock-news-dialog.tsx)

거래량/급등 테이블에서 종목 클릭 시 Dialog로 뉴스 표시. shadcn/ui 컴포넌트 사용:
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`
- `Separator`
- `lucide-react`의 `ExternalLink` 아이콘

### 대시보드 레이아웃

```
[지수 카드]  [지수 카드]
[섹터 히트맵           ]
[투자자 동향           ]
[급등/급락 테이블      ]  ← 종목 클릭 시 뉴스 Dialog
[거래량 상위 20        ]  ← 종목 클릭 시 뉴스 Dialog (10→20 확장)
[거래대금 상위 20      ]  ← 신규 섹션 + 종목 클릭 시 뉴스 Dialog
[오늘의 주요 뉴스      ]  ← 신규 섹션
```

---

## 뉴스 크롤링 로직

### 크롤링 대상 URL

```
https://search.naver.com/search.naver?where=news&query={종목명}
```

### 크롤링 흐름

```
1. 시세 크롤링 완료
   ↓
2. 분석 대상 종목 수집
   - 거래량 상위 20 (KOSPI + KOSDAQ = 최대 40개)
   - 거래대금 상위 20 (KOSPI + KOSDAQ = 최대 40개)
   - 급등 종목 상위 10 (KOSPI + KOSDAQ = 최대 20개)
   - 주도섹터 상위 3개 × 대장주 3개 = 최대 9개
   ↓
3. 중복 제거 (동일 종목 한 번만 크롤링)
   → 예상 최종 종목 수: 50~70개
   ↓
4. 종목별 뉴스 5개씩 크롤링
   ↓
5. DB 저장
```

### 크롤링 데이터 추출

| 필드 | 추출 방법 |
|------|-----------|
| title | 뉴스 제목 텍스트 |
| url | 뉴스 링크 href |
| source | 언론사 이름 |
| publishedAt | 발행 시간 파싱 |

### 요청 제한 (IP 차단 방지)

- 종목 간 1초 딜레이
- User-Agent 헤더 설정
- 일일 1회 수집 (장 마감 후)

---

## 기존 기능 수정사항

### 거래량 상위 확장 (10 → 20)

- `naver-finance.crawler.ts`: 크롤링 개수 10 → 20
- `top-volume.tsx`: 테이블 행 20개 표시

### 거래대금 상위 20 크롤링 추가

- `naver-finance.crawler.ts`: `crawlTopTradingValueStocks()` 메서드 추가
- 크롤링 URL: `https://finance.naver.com/sise/sise_quant_high.naver?sosok={0|1}`

---

## 범위 외 (향후 고려)

- AI 기반 뉴스 요약
- 증권사 Open API 연동 (한국투자증권 등)
- 전자공시(DART) 연동
- 증권사 리서치 리포트 연동
