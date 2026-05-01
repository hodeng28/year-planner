# 주식 뉴스 수집 기능 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 주식 시장 데이터에 시가총액/거래대금 필터와 종목별 뉴스 수집 기능 추가

**Architecture:** 기존 NaverFinanceCrawler 확장 + NaverNewsCrawler 신규 생성. 프론트엔드에 Range Slider 필터 UI와 뉴스 표시 컴포넌트 추가.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Next.js, shadcn/ui, cheerio

---

## 파일 구조

### 백엔드 (apps/api)

| 파일 | 작업 | 설명 |
|------|------|------|
| `prisma/schema.prisma` | 수정 | TopTradingValueStock, StockNews 모델 추가, 기존 모델에 marketCap 추가 |
| `src/stock/crawler/naver-finance.crawler.ts` | 수정 | 거래량 20개 확장, 거래대금 크롤링, marketCap 추가 |
| `src/stock/crawler/naver-news.crawler.ts` | 생성 | 네이버 뉴스 크롤러 |
| `src/stock/stock.repository.ts` | 수정 | 새 모델 CRUD 메서드 |
| `src/stock/stock.service.ts` | 수정 | 뉴스 크롤링 로직, 필터 로직 |
| `src/stock/stock.controller.ts` | 수정 | 뉴스 API, 필터 쿼리 파라미터 |
| `src/stock/scheduler/stock-scheduler.service.ts` | 수정 | 뉴스 크롤링 스케줄 추가 |
| `src/stock/stock.module.ts` | 수정 | NaverNewsCrawler 등록 |

### 프론트엔드 (apps/stock)

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/ui/slider.tsx` | 생성 | shadcn Slider 컴포넌트 |
| `src/components/ui/dialog.tsx` | 생성 | shadcn Dialog 컴포넌트 |
| `src/components/dashboard/filter-bar.tsx` | 생성 | 시가총액/거래대금 Range Slider 필터 |
| `src/components/dashboard/top-volume.tsx` | 수정 | 20개 표시, 종목 클릭 시 뉴스 Dialog |
| `src/components/dashboard/top-trading-value.tsx` | 생성 | 거래대금 상위 20 |
| `src/components/dashboard/stock-news-dialog.tsx` | 생성 | 종목별 뉴스 팝업 |
| `src/components/dashboard/stock-news-card.tsx` | 생성 | 전체 뉴스 섹션 |
| `src/app/page.tsx` | 수정 | 새 컴포넌트 통합 |
| `src/hooks/use-stock.ts` | 수정 | 뉴스 조회 hook 추가 |
| `src/lib/api.ts` | 수정 | 뉴스 API 메서드 추가 |

### 공유 타입 (packages/types)

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/stock.ts` | 수정 | TopTradingValueStock, StockNews 타입 추가, 기존 타입에 marketCap 추가 |

---

## Task 1: Prisma 스키마 업데이트

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: TopVolumeStock, StockMover 모델에 marketCap 필드 추가**

```prisma
// 거래량 상위 종목 - marketCap 추가
model TopVolumeStock {
  id            String     @id @default(uuid())
  date          String
  rank          Int
  stockCode     String
  stockName     String
  closePrice    Int
  change        Int
  changePercent Float
  volume        BigInt
  marketCap     BigInt     // 시가총액 (원) - 신규
  market        MarketType
  createdAt     DateTime   @default(now())

  @@unique([date, market, rank])
  @@index([date])
}

// 급등/급락 종목 - marketCap 추가
model StockMover {
  id            String     @id @default(uuid())
  date          String
  type          MoverType
  rank          Int
  stockCode     String
  stockName     String
  closePrice    Int
  change        Int
  changePercent Float
  volume        BigInt
  marketCap     BigInt     // 시가총액 (원) - 신규
  market        MarketType
  createdAt     DateTime   @default(now())

  @@unique([date, market, type, rank])
  @@index([date])
  @@index([type])
}
```

- [ ] **Step 2: TopTradingValueStock 모델 추가**

스키마 파일 하단(InvestorTrading 모델 아래)에 추가:

```prisma
// 거래대금 상위 종목
model TopTradingValueStock {
  id            String     @id @default(uuid())
  date          String
  rank          Int
  stockCode     String
  stockName     String
  closePrice    Int
  change        Int
  changePercent Float
  tradingValue  BigInt     // 거래대금 (백만원)
  marketCap     BigInt     // 시가총액 (원)
  market        MarketType
  createdAt     DateTime   @default(now())

  @@unique([date, market, rank])
  @@index([date])
}
```

- [ ] **Step 3: StockNews 모델 추가**

TopTradingValueStock 아래에 추가:

```prisma
// 주식 뉴스
model StockNews {
  id          String   @id @default(uuid())
  date        String
  stockCode   String
  stockName   String
  title       String
  url         String
  source      String
  publishedAt DateTime
  createdAt   DateTime @default(now())

  @@unique([date, stockCode, url])
  @@index([date])
  @@index([stockCode])
}
```

- [ ] **Step 4: Prisma 마이그레이션 생성 및 적용**

```bash
cd apps/api && npx prisma migrate dev --name add_stock_news_and_marketcap
```

Expected: Migration 성공, 새 테이블 생성

- [ ] **Step 5: Prisma Client 재생성 확인**

```bash
cd apps/api && npx prisma generate
```

Expected: Prisma Client 생성 완료

- [ ] **Step 6: Commit**

```bash
git add apps/api/prisma/
git commit -m "feat(api): add TopTradingValueStock, StockNews models and marketCap field"
```

---

## Task 2: TypeScript 타입 업데이트

**Files:**
- Modify: `packages/types/src/stock.ts`

- [ ] **Step 1: 기존 타입에 marketCap 추가**

```typescript
/**
 * 거래량 상위 종목 - marketCap 추가
 */
export interface TopVolumeStock {
  id: string;
  date: string;
  rank: number;
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;    // 시가총액 (원) - 신규
  market: MarketType;
  createdAt: Date;
}

/**
 * 급등/급락 종목 - marketCap 추가
 */
export interface StockMover {
  id: string;
  date: string;
  type: MoverType;
  rank: number;
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;    // 시가총액 (원) - 신규
  market: MarketType;
  createdAt: Date;
}
```

- [ ] **Step 2: TopTradingValueStock 타입 추가**

```typescript
/**
 * 거래대금 상위 종목
 */
export interface TopTradingValueStock {
  id: string;
  date: string;
  rank: number;
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  tradingValue: number;  // 거래대금 (백만원)
  marketCap: number;     // 시가총액 (원)
  market: MarketType;
  createdAt: Date;
}
```

- [ ] **Step 3: StockNews 타입 추가**

```typescript
/**
 * 주식 뉴스
 */
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

- [ ] **Step 4: DailyStockSummary 확장**

```typescript
/**
 * 일일 종합 요약
 */
export interface DailyStockSummary {
  date: string;
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  topVolume: TopVolumeStock[];
  topTradingValue: TopTradingValueStock[];  // 신규
  gainers: StockMover[];
  losers: StockMover[];
  investorTrading: InvestorTrading[];
  news: StockNews[];                        // 신규
}
```

- [ ] **Step 5: 필터 타입 추가**

```typescript
/**
 * 필터 옵션
 */
export interface StockFilter {
  mcMin?: number;  // 시가총액 최소 (억원)
  mcMax?: number;  // 시가총액 최대 (억원)
  tvMin?: number;  // 거래대금 최소 (억원)
  tvMax?: number;  // 거래대금 최대 (억원)
}
```

- [ ] **Step 6: Export 확인 및 빌드**

```bash
cd packages/types && pnpm build
```

Expected: 빌드 성공

- [ ] **Step 7: Commit**

```bash
git add packages/types/
git commit -m "feat(types): add TopTradingValueStock, StockNews types and marketCap field"
```

---

## Task 3: NaverFinanceCrawler 확장

**Files:**
- Modify: `apps/api/src/stock/crawler/naver-finance.crawler.ts`

- [ ] **Step 1: CrawledStock 인터페이스에 marketCap 추가**

```typescript
export interface CrawledStock {
  rank: number;
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  volume: bigint;
  marketCap: bigint;    // 신규
  market: MarketType;
}
```

- [ ] **Step 2: CrawledTradingValueStock 인터페이스 추가**

```typescript
export interface CrawledTradingValueStock {
  rank: number;
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  tradingValue: bigint;
  marketCap: bigint;
  market: MarketType;
}
```

- [ ] **Step 3: crawlTopVolumeStocks 20개로 확장 및 marketCap 추가**

기존 메서드 수정:

```typescript
async crawlTopVolumeStocks(market: MarketType): Promise<CrawledStock[]> {
  this.logger.log(`Crawling top volume stocks for ${market}...`);
  const stocks: CrawledStock[] = [];

  try {
    const sosok = market === 'KOSPI' ? '0' : '1';
    const $ = await this.fetchPage(
      `https://finance.naver.com/sise/sise_quant.naver?sosok=${sosok}`,
    );

    $('table.type_2 tbody tr').each((index, row) => {
      if (index >= 20) return false;  // 10 → 20으로 변경
      const $row = $(row);
      const stockName = $row.find('td:nth-child(2) a').text().trim();
      if (!stockName) return;

      const stockHref = $row.find('td:nth-child(2) a').attr('href') || '';
      const stockCode = stockHref.match(/code=(\d+)/)?.[1] || '';
      const closePrice = this.parseNumber($row.find('td:nth-child(3)').text());
      const changeText = $row.find('td:nth-child(4)').text().trim();
      const change = this.parseNumber(changeText);
      const isDown = $row.find('td:nth-child(4) span').hasClass('nv01');
      const changePercent = this.parseNumber($row.find('td:nth-child(5)').text());
      const volume = this.parseBigInt($row.find('td:nth-child(6)').text());
      // 시가총액 크롤링 (억원 단위를 원으로 변환)
      const marketCapText = $row.find('td:nth-child(7)').text().trim();
      const marketCap = this.parseBigInt(marketCapText) * BigInt(100000000);

      stocks.push({
        rank: stocks.length + 1,
        stockCode,
        stockName,
        closePrice,
        change: isDown ? -change : change,
        changePercent: isDown ? -changePercent : changePercent,
        volume,
        marketCap,
        market,
      });
    });
  } catch (error) {
    this.logger.error(`Failed to crawl top volume stocks for ${market}`, error);
  }

  return stocks;
}
```

- [ ] **Step 4: crawlTopTradingValueStocks 메서드 추가**

```typescript
async crawlTopTradingValueStocks(market: MarketType): Promise<CrawledTradingValueStock[]> {
  this.logger.log(`Crawling top trading value stocks for ${market}...`);
  const stocks: CrawledTradingValueStock[] = [];

  try {
    const sosok = market === 'KOSPI' ? '0' : '1';
    const $ = await this.fetchPage(
      `https://finance.naver.com/sise/sise_quant_high.naver?sosok=${sosok}`,
    );

    $('table.type_2 tbody tr').each((index, row) => {
      if (index >= 20) return false;
      const $row = $(row);
      const stockName = $row.find('td:nth-child(2) a').text().trim();
      if (!stockName) return;

      const stockHref = $row.find('td:nth-child(2) a').attr('href') || '';
      const stockCode = stockHref.match(/code=(\d+)/)?.[1] || '';
      const closePrice = this.parseNumber($row.find('td:nth-child(3)').text());
      const changeText = $row.find('td:nth-child(4)').text().trim();
      const change = this.parseNumber(changeText);
      const isDown = $row.find('td:nth-child(4) span').hasClass('nv01');
      const changePercent = this.parseNumber($row.find('td:nth-child(5)').text());
      // 거래대금 (백만원 단위)
      const tradingValue = this.parseBigInt($row.find('td:nth-child(6)').text());
      // 시가총액 (억원 → 원)
      const marketCapText = $row.find('td:nth-child(7)').text().trim();
      const marketCap = this.parseBigInt(marketCapText) * BigInt(100000000);

      stocks.push({
        rank: stocks.length + 1,
        stockCode,
        stockName,
        closePrice,
        change: isDown ? -change : change,
        changePercent: isDown ? -changePercent : changePercent,
        tradingValue,
        marketCap,
        market,
      });
    });
  } catch (error) {
    this.logger.error(`Failed to crawl top trading value stocks for ${market}`, error);
  }

  return stocks;
}
```

- [ ] **Step 5: crawlStockMovers에 marketCap 추가**

기존 메서드 수정하여 marketCap 크롤링 추가:

```typescript
async crawlStockMovers(market: MarketType, type: MoverType): Promise<CrawledStock[]> {
  this.logger.log(`Crawling ${type} for ${market}...`);
  const stocks: CrawledStock[] = [];

  try {
    const sosok = market === 'KOSPI' ? '0' : '1';
    const urlType = type === 'GAINER' ? 'rise' : 'fall';
    const $ = await this.fetchPage(
      `https://finance.naver.com/sise/sise_${urlType}.naver?sosok=${sosok}`,
    );

    $('table.type_2 tbody tr').each((index, row) => {
      if (index >= 10) return false;
      const $row = $(row);
      const stockName = $row.find('td:nth-child(2) a').text().trim();
      if (!stockName) return;

      const stockHref = $row.find('td:nth-child(2) a').attr('href') || '';
      const stockCode = stockHref.match(/code=(\d+)/)?.[1] || '';
      const closePrice = this.parseNumber($row.find('td:nth-child(3)').text());
      const changeText = $row.find('td:nth-child(4)').text().trim();
      const change = this.parseNumber(changeText);
      const changePercent = this.parseNumber($row.find('td:nth-child(5)').text());
      const volume = this.parseBigInt($row.find('td:nth-child(6)').text());
      // 시가총액 추가
      const marketCapText = $row.find('td:nth-child(7)').text().trim();
      const marketCap = this.parseBigInt(marketCapText) * BigInt(100000000);

      stocks.push({
        rank: stocks.length + 1,
        stockCode,
        stockName,
        closePrice,
        change: type === 'GAINER' ? change : -change,
        changePercent: type === 'GAINER' ? changePercent : -changePercent,
        volume,
        marketCap,
        market,
      });
    });
  } catch (error) {
    this.logger.error(`Failed to crawl ${type} for ${market}`, error);
  }

  return stocks;
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/stock/crawler/naver-finance.crawler.ts
git commit -m "feat(api): extend crawler to 20 items, add trading value and marketCap"
```

---

## Task 4: NaverNewsCrawler 생성

**Files:**
- Create: `apps/api/src/stock/crawler/naver-news.crawler.ts`

- [ ] **Step 1: 뉴스 크롤러 기본 구조 생성**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CrawledNews {
  stockCode: string;
  stockName: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
}

@Injectable()
export class NaverNewsCrawler {
  private readonly logger = new Logger(NaverNewsCrawler.name);

  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    return cheerio.load(response.data);
  }

  private parseRelativeTime(text: string): Date {
    const now = new Date();
    const cleaned = text.trim();

    if (cleaned.includes('분 전')) {
      const minutes = parseInt(cleaned) || 0;
      return new Date(now.getTime() - minutes * 60 * 1000);
    }
    if (cleaned.includes('시간 전')) {
      const hours = parseInt(cleaned) || 0;
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }
    if (cleaned.includes('일 전')) {
      const days = parseInt(cleaned) || 0;
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    // YYYY.MM.DD. 형식
    const dateMatch = cleaned.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    if (dateMatch) {
      return new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
    }

    return now;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async crawlNewsForStock(
    stockCode: string,
    stockName: string,
    limit: number = 5,
  ): Promise<CrawledNews[]> {
    this.logger.log(`Crawling news for ${stockName} (${stockCode})...`);
    const news: CrawledNews[] = [];

    try {
      const encodedName = encodeURIComponent(stockName);
      const url = `https://search.naver.com/search.naver?where=news&query=${encodedName}&sm=tab_opt&sort=1`;
      const $ = await this.fetchPage(url);

      $('div.news_area').each((index, element) => {
        if (index >= limit) return false;

        const $el = $(element);
        const title = $el.find('a.news_tit').text().trim();
        const newsUrl = $el.find('a.news_tit').attr('href') || '';
        const source = $el.find('a.info.press').text().trim();
        const timeText = $el.find('span.info').last().text().trim();
        const publishedAt = this.parseRelativeTime(timeText);

        if (title && newsUrl) {
          news.push({
            stockCode,
            stockName,
            title,
            url: newsUrl,
            source: source || '알 수 없음',
            publishedAt,
          });
        }
      });
    } catch (error) {
      this.logger.error(`Failed to crawl news for ${stockName}`, error);
    }

    return news;
  }

  async crawlNewsForStocks(
    stocks: Array<{ stockCode: string; stockName: string }>,
    newsPerStock: number = 5,
  ): Promise<CrawledNews[]> {
    const allNews: CrawledNews[] = [];
    const uniqueStocks = this.deduplicateStocks(stocks);

    this.logger.log(`Crawling news for ${uniqueStocks.length} unique stocks...`);

    for (const stock of uniqueStocks) {
      const stockNews = await this.crawlNewsForStock(
        stock.stockCode,
        stock.stockName,
        newsPerStock,
      );
      allNews.push(...stockNews);

      // IP 차단 방지를 위한 딜레이
      await this.delay(1000);
    }

    this.logger.log(`Crawled ${allNews.length} total news articles`);
    return allNews;
  }

  private deduplicateStocks(
    stocks: Array<{ stockCode: string; stockName: string }>,
  ): Array<{ stockCode: string; stockName: string }> {
    const seen = new Set<string>();
    return stocks.filter((stock) => {
      if (seen.has(stock.stockCode)) {
        return false;
      }
      seen.add(stock.stockCode);
      return true;
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/stock/crawler/naver-news.crawler.ts
git commit -m "feat(api): add NaverNewsCrawler for stock news"
```

---

## Task 5: StockRepository 확장

**Files:**
- Modify: `apps/api/src/stock/stock.repository.ts`

- [ ] **Step 1: TopTradingValueStock CRUD 메서드 추가**

```typescript
// ==================== Top Trading Value Stocks ====================

async upsertTopTradingValueStock(
  data: Omit<TopTradingValueStock, 'id' | 'createdAt'>,
): Promise<TopTradingValueStock> {
  return this.prisma.topTradingValueStock.upsert({
    where: {
      date_market_rank: {
        date: data.date,
        market: data.market,
        rank: data.rank,
      },
    },
    update: data,
    create: data,
  });
}

async findTopTradingValueStocks(date: string): Promise<TopTradingValueStock[]> {
  return this.prisma.topTradingValueStock.findMany({
    where: { date },
    orderBy: [{ market: 'asc' }, { rank: 'asc' }],
  });
}

async findLatestTopTradingValueStocks(): Promise<TopTradingValueStock[]> {
  const latest = await this.prisma.topTradingValueStock.findFirst({
    orderBy: { date: 'desc' },
  });
  if (!latest) return [];
  return this.findTopTradingValueStocks(latest.date);
}
```

- [ ] **Step 2: StockNews CRUD 메서드 추가**

```typescript
// ==================== Stock News ====================

async upsertStockNews(
  data: Omit<StockNews, 'id' | 'createdAt'>,
): Promise<StockNews> {
  return this.prisma.stockNews.upsert({
    where: {
      date_stockCode_url: {
        date: data.date,
        stockCode: data.stockCode,
        url: data.url,
      },
    },
    update: data,
    create: data,
  });
}

async findStockNews(date: string, stockCode?: string): Promise<StockNews[]> {
  return this.prisma.stockNews.findMany({
    where: {
      date,
      ...(stockCode && { stockCode }),
    },
    orderBy: { publishedAt: 'desc' },
  });
}

async findLatestStockNews(stockCode?: string): Promise<StockNews[]> {
  const latest = await this.prisma.stockNews.findFirst({
    orderBy: { date: 'desc' },
  });
  if (!latest) return [];
  return this.findStockNews(latest.date, stockCode);
}

async findNewsByStockCode(stockCode: string, limit: number = 5): Promise<StockNews[]> {
  return this.prisma.stockNews.findMany({
    where: { stockCode },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}
```

- [ ] **Step 3: import 업데이트**

파일 상단 import에 추가:

```typescript
import {
  MarketIndex,
  SectorPerformance,
  TopVolumeStock,
  StockMover,
  InvestorTrading,
  TopTradingValueStock,  // 추가
  StockNews,             // 추가
} from '@prisma/client';
```

- [ ] **Step 4: deleteByDate 메서드 업데이트**

```typescript
async deleteByDate(date: string): Promise<void> {
  await Promise.all([
    this.prisma.marketIndex.deleteMany({ where: { date } }),
    this.prisma.sectorPerformance.deleteMany({ where: { date } }),
    this.prisma.topVolumeStock.deleteMany({ where: { date } }),
    this.prisma.topTradingValueStock.deleteMany({ where: { date } }),  // 추가
    this.prisma.stockMover.deleteMany({ where: { date } }),
    this.prisma.investorTrading.deleteMany({ where: { date } }),
    this.prisma.stockNews.deleteMany({ where: { date } }),            // 추가
  ]);
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/stock/stock.repository.ts
git commit -m "feat(api): add repository methods for TopTradingValueStock and StockNews"
```

---

## Task 6: StockService 확장

**Files:**
- Modify: `apps/api/src/stock/stock.service.ts`

- [ ] **Step 1: NaverNewsCrawler 의존성 주입**

```typescript
import { NaverNewsCrawler } from './crawler/naver-news.crawler';

constructor(
  private readonly repository: StockRepository,
  private readonly crawler: NaverFinanceCrawler,
  private readonly newsCrawler: NaverNewsCrawler,  // 추가
) {}
```

- [ ] **Step 2: DailySummary 인터페이스 확장**

```typescript
export interface DailySummary {
  date: string;
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  topVolume: TopVolumeStock[];
  topTradingValue: TopTradingValueStock[];  // 추가
  gainers: StockMover[];
  losers: StockMover[];
  investorTrading: InvestorTrading[];
  news: StockNews[];                        // 추가
}
```

- [ ] **Step 3: crawlAndSave에 거래대금 크롤링 추가**

crawlAndSave 메서드 내 거래량 상위 크롤링 후에 추가:

```typescript
// 거래대금 상위 종목 크롤링 및 저장
const kospiTradingValue = await this.crawler.crawlTopTradingValueStocks('KOSPI');
const kosdaqTradingValue = await this.crawler.crawlTopTradingValueStocks('KOSDAQ');
for (const stock of [...kospiTradingValue, ...kosdaqTradingValue]) {
  await this.repository.upsertTopTradingValueStock({
    date: targetDate,
    ...stock,
  });
}
this.logger.log(`Saved ${kospiTradingValue.length + kosdaqTradingValue.length} top trading value stocks`);
```

- [ ] **Step 4: crawlNews 메서드 추가**

```typescript
async crawlNews(date?: string): Promise<{ success: boolean; message: string; count: number }> {
  const targetDate = date || format(subDays(new Date(), 1), 'yyyy-MM-dd');
  this.logger.log(`Starting news crawl for date: ${targetDate}`);

  try {
    // 뉴스 수집 대상 종목 조회
    const [topVolume, topTradingValue, movers, sectors] = await Promise.all([
      this.repository.findTopVolumeStocks(targetDate),
      this.repository.findTopTradingValueStocks(targetDate),
      this.repository.findStockMovers(targetDate, 'GAINER'),
      this.repository.findSectorPerformances(targetDate),
    ]);

    // 주도섹터 상위 3개의 대장주 (섹터별 상위 종목은 별도 크롤링 필요)
    // 현재는 거래량+거래대금+급등 종목만 대상으로 함
    const stocksForNews = [
      ...topVolume.map((s) => ({ stockCode: s.stockCode, stockName: s.stockName })),
      ...topTradingValue.map((s) => ({ stockCode: s.stockCode, stockName: s.stockName })),
      ...movers.map((s) => ({ stockCode: s.stockCode, stockName: s.stockName })),
    ];

    const crawledNews = await this.newsCrawler.crawlNewsForStocks(stocksForNews, 5);

    for (const news of crawledNews) {
      await this.repository.upsertStockNews({
        date: targetDate,
        ...news,
      });
    }

    return {
      success: true,
      message: `Successfully crawled ${crawledNews.length} news articles`,
      count: crawledNews.length,
    };
  } catch (error) {
    this.logger.error(`Failed to crawl news for ${targetDate}`, error);
    return {
      success: false,
      message: `Failed to crawl news: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0,
    };
  }
}
```

- [ ] **Step 5: getSummary 메서드 확장**

```typescript
async getSummary(date: string): Promise<DailySummary> {
  const [indices, sectors, topVolume, topTradingValue, movers, investorTrading, news] = await Promise.all([
    this.repository.findMarketIndices(date),
    this.repository.findSectorPerformances(date),
    this.repository.findTopVolumeStocks(date),
    this.repository.findTopTradingValueStocks(date),  // 추가
    this.repository.findStockMovers(date),
    this.repository.findInvestorTrading(date),
    this.repository.findStockNews(date),              // 추가
  ]);

  return {
    date,
    indices,
    sectors,
    topVolume,
    topTradingValue,  // 추가
    gainers: movers.filter((m) => m.type === 'GAINER'),
    losers: movers.filter((m) => m.type === 'LOSER'),
    investorTrading,
    news,             // 추가
  };
}
```

- [ ] **Step 6: 뉴스 조회 메서드 추가**

```typescript
async getStockNews(date?: string, stockCode?: string): Promise<StockNews[]> {
  if (date) {
    return this.repository.findStockNews(date, stockCode);
  }
  return this.repository.findLatestStockNews(stockCode);
}

async getNewsByStockCode(stockCode: string): Promise<StockNews[]> {
  return this.repository.findNewsByStockCode(stockCode);
}
```

- [ ] **Step 7: import 업데이트**

```typescript
import {
  MarketIndex,
  SectorPerformance,
  TopVolumeStock,
  StockMover,
  InvestorTrading,
  TopTradingValueStock,  // 추가
  StockNews,             // 추가
} from '@prisma/client';
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/stock/stock.service.ts
git commit -m "feat(api): add news crawling and topTradingValue to service"
```

---

## Task 7: StockController 확장

**Files:**
- Modify: `apps/api/src/stock/stock.controller.ts`

- [ ] **Step 1: 뉴스 API 엔드포인트 추가**

```typescript
/**
 * 최신 전체 뉴스
 */
@Get('news/latest')
async getLatestNews(): Promise<StockNews[]> {
  return this.stockService.getStockNews();
}

/**
 * 종목별 뉴스
 */
@Get('news/:stockCode')
async getNewsByStock(@Param('stockCode') stockCode: string): Promise<StockNews[]> {
  return this.stockService.getNewsByStockCode(stockCode);
}

/**
 * 수동 뉴스 크롤링
 */
@Post('crawl/news')
@HttpCode(HttpStatus.OK)
async triggerNewsCrawl(
  @Query('date') date?: string,
): Promise<{ success: boolean; message: string; count: number }> {
  return this.stockService.crawlNews(date);
}
```

- [ ] **Step 2: 거래대금 상위 종목 엔드포인트 추가**

```typescript
/**
 * 거래대금 상위 종목
 */
@Get('top-trading-value')
async getTopTradingValueStocks(@Query('date') date?: string): Promise<TopTradingValueStock[]> {
  if (date) {
    return this.stockService.getTopTradingValueStocks(date);
  }
  return this.stockService.getTopTradingValueStocks();
}
```

- [ ] **Step 3: import 업데이트**

```typescript
import {
  Controller,
  Get,
  Post,
  Query,
  Param,          // 추가
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  MarketIndex,
  SectorPerformance,
  TopVolumeStock,
  StockMover,
  InvestorTrading,
  TopTradingValueStock,  // 추가
  StockNews,             // 추가
} from '@prisma/client';
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/stock/stock.controller.ts
git commit -m "feat(api): add news and top trading value API endpoints"
```

---

## Task 8: StockModule 업데이트

**Files:**
- Modify: `apps/api/src/stock/stock.module.ts`

- [ ] **Step 1: NaverNewsCrawler 등록**

```typescript
import { NaverNewsCrawler } from './crawler/naver-news.crawler';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [StockController],
  providers: [
    StockService,
    StockRepository,
    NaverFinanceCrawler,
    NaverNewsCrawler,        // 추가
    StockSchedulerService,
  ],
})
export class StockModule {}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/stock/stock.module.ts
git commit -m "feat(api): register NaverNewsCrawler in module"
```

---

## Task 9: Scheduler 업데이트

**Files:**
- Modify: `apps/api/src/stock/scheduler/stock-scheduler.service.ts`

- [ ] **Step 1: 뉴스 크롤링 스케줄 추가**

```typescript
/**
 * 시세 크롤링 후 5분 뒤 뉴스 크롤링
 * 16:35 KST
 */
@Cron('35 16 * * 1-5', {
  timeZone: 'Asia/Seoul',
})
async handleNewsCrawl() {
  this.logger.log('Starting scheduled news crawl...');
  const result = await this.stockService.crawlNews();
  this.logger.log(`News crawl completed: ${result.message}`);
}
```

- [ ] **Step 2: 기존 시세 크롤링 시간 조정 (16:30)**

```typescript
/**
 * 매일 장 마감 후 (16:30 KST) 시세 데이터 수집
 * 월~금요일만 실행
 */
@Cron('30 16 * * 1-5', {
  timeZone: 'Asia/Seoul',
})
async handleDailyCrawl() {
  this.logger.log('Starting scheduled daily stock data crawl...');
  const result = await this.stockService.crawlAndSave();
  this.logger.log(`Scheduled crawl completed: ${result.message}`);
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/stock/scheduler/stock-scheduler.service.ts
git commit -m "feat(api): add news crawling schedule after market close"
```

---

## Task 10: shadcn Slider 컴포넌트 추가

**Files:**
- Create: `apps/stock/src/components/ui/slider.tsx`

- [ ] **Step 1: shadcn CLI로 Slider 추가**

```bash
cd apps/stock && npx shadcn@latest add slider
```

Expected: `src/components/ui/slider.tsx` 생성

- [ ] **Step 2: shadcn CLI로 Dialog 추가**

```bash
cd apps/stock && npx shadcn@latest add dialog
```

Expected: `src/components/ui/dialog.tsx` 생성

- [ ] **Step 3: shadcn CLI로 ScrollArea 추가**

```bash
cd apps/stock && npx shadcn@latest add scroll-area
```

Expected: `src/components/ui/scroll-area.tsx` 생성

- [ ] **Step 4: Commit**

```bash
git add apps/stock/src/components/ui/
git commit -m "feat(stock): add shadcn slider, dialog, scroll-area components"
```

---

## Task 11: FilterBar 컴포넌트 생성

**Files:**
- Create: `apps/stock/src/components/dashboard/filter-bar.tsx`

- [ ] **Step 1: FilterBar 컴포넌트 생성**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  mcMin: number;
  mcMax: number;
  tvMin: number;
  tvMax: number;
}

// 로그 스케일 변환 (슬라이더 값 0-100 → 실제 값)
const MARKET_CAP_MARKS = [0, 1000, 5000, 10000, 50000, 100000, 500000]; // 억원
const TRADING_VALUE_MARKS = [0, 50, 100, 500, 1000, 5000]; // 억원

function logScale(value: number, marks: number[]): number {
  const index = Math.floor((value / 100) * (marks.length - 1));
  const nextIndex = Math.min(index + 1, marks.length - 1);
  const ratio = (value / 100) * (marks.length - 1) - index;
  return Math.round(marks[index] + (marks[nextIndex] - marks[index]) * ratio);
}

function inverseLogScale(value: number, marks: number[]): number {
  for (let i = 0; i < marks.length - 1; i++) {
    if (value >= marks[i] && value <= marks[i + 1]) {
      const ratio = (value - marks[i]) / (marks[i + 1] - marks[i]);
      return ((i + ratio) / (marks.length - 1)) * 100;
    }
  }
  return 100;
}

function formatValue(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}조`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}천억`;
  return `${value}억`;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mcRange, setMcRange] = useState<[number, number]>([0, 100]);
  const [tvRange, setTvRange] = useState<[number, number]>([0, 100]);

  // URL에서 초기값 로드
  useEffect(() => {
    const mcMin = parseInt(searchParams.get("mcMin") || "0");
    const mcMax = parseInt(searchParams.get("mcMax") || "500000");
    const tvMin = parseInt(searchParams.get("tvMin") || "0");
    const tvMax = parseInt(searchParams.get("tvMax") || "5000");

    setMcRange([
      inverseLogScale(mcMin, MARKET_CAP_MARKS),
      inverseLogScale(mcMax, MARKET_CAP_MARKS),
    ]);
    setTvRange([
      inverseLogScale(tvMin, TRADING_VALUE_MARKS),
      inverseLogScale(tvMax, TRADING_VALUE_MARKS),
    ]);
  }, [searchParams]);

  const handleApply = () => {
    const filters: FilterState = {
      mcMin: logScale(mcRange[0], MARKET_CAP_MARKS),
      mcMax: logScale(mcRange[1], MARKET_CAP_MARKS),
      tvMin: logScale(tvRange[0], TRADING_VALUE_MARKS),
      tvMax: logScale(tvRange[1], TRADING_VALUE_MARKS),
    };

    // URL 업데이트
    const params = new URLSearchParams();
    if (filters.mcMin > 0) params.set("mcMin", filters.mcMin.toString());
    if (filters.mcMax < 500000) params.set("mcMax", filters.mcMax.toString());
    if (filters.tvMin > 0) params.set("tvMin", filters.tvMin.toString());
    if (filters.tvMax < 5000) params.set("tvMax", filters.tvMax.toString());

    router.push(`?${params.toString()}`);
    onFilterChange?.(filters);
  };

  const mcMinValue = logScale(mcRange[0], MARKET_CAP_MARKS);
  const mcMaxValue = logScale(mcRange[1], MARKET_CAP_MARKS);
  const tvMinValue = logScale(tvRange[0], TRADING_VALUE_MARKS);
  const tvMaxValue = logScale(tvRange[1], TRADING_VALUE_MARKS);

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">시가총액</span>
            <span className="font-medium">
              {formatValue(mcMinValue)} ~ {formatValue(mcMaxValue)}
            </span>
          </div>
          <Slider
            value={mcRange}
            onValueChange={(value) => setMcRange(value as [number, number])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">거래대금</span>
            <span className="font-medium">
              {formatValue(tvMinValue)} ~ {formatValue(tvMaxValue)}
            </span>
          </div>
          <Slider
            value={tvRange}
            onValueChange={(value) => setTvRange(value as [number, number])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <Button onClick={handleApply} className="w-full">
          필터 적용
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/stock/src/components/dashboard/filter-bar.tsx
git commit -m "feat(stock): add FilterBar component with range sliders"
```

---

## Task 12: StockNewsDialog 컴포넌트 생성

**Files:**
- Create: `apps/stock/src/components/dashboard/stock-news-dialog.tsx`

- [ ] **Step 1: StockNewsDialog 컴포넌트 생성**

```tsx
"use client";

import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StockNews } from "@year-planner/types";

interface StockNewsDialogProps {
  stockCode: string;
  stockName: string;
  news: StockNews[];
  children: React.ReactNode;
}

export function StockNewsDialog({
  stockCode,
  stockName,
  news,
  children,
}: StockNewsDialogProps) {
  const stockNews = news.filter((n) => n.stockCode === stockCode);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stockName}
            <span className="text-sm text-muted-foreground font-normal">
              ({stockCode})
            </span>
          </DialogTitle>
        </DialogHeader>

        {stockNews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            관련 뉴스가 없습니다
          </p>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {stockNews.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium group-hover:text-primary line-clamp-2">
                        {item.title}
                      </h4>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.publishedAt), "M월 d일 HH:mm", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Badge 컴포넌트 추가 (없는 경우)**

```bash
cd apps/stock && npx shadcn@latest add badge separator
```

- [ ] **Step 3: Commit**

```bash
git add apps/stock/src/components/dashboard/stock-news-dialog.tsx apps/stock/src/components/ui/
git commit -m "feat(stock): add StockNewsDialog component"
```

---

## Task 13: StockNewsCard 컴포넌트 생성

**Files:**
- Create: `apps/stock/src/components/dashboard/stock-news-card.tsx`

- [ ] **Step 1: StockNewsCard 컴포넌트 생성**

```tsx
"use client";

import { ExternalLink, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StockNews } from "@year-planner/types";

interface StockNewsCardProps {
  news: StockNews[];
}

export function StockNewsCard({ news }: StockNewsCardProps) {
  // 최신 뉴스 30개만 표시
  const latestNews = news.slice(0, 30);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          오늘의 주요 뉴스
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestNews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            수집된 뉴스가 없습니다
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {latestNews.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs shrink-0">
                          {item.stockName}
                        </Badge>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {item.source}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-medium line-clamp-2">
                        {item.title}
                      </h4>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {format(new Date(item.publishedAt), "M월 d일 HH:mm", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/stock/src/components/dashboard/stock-news-card.tsx
git commit -m "feat(stock): add StockNewsCard component for daily news section"
```

---

## Task 14: TopTradingValue 컴포넌트 생성

**Files:**
- Create: `apps/stock/src/components/dashboard/top-trading-value.tsx`

- [ ] **Step 1: TopTradingValueCard 컴포넌트 생성**

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, formatPercent, cn } from "@/lib/utils";
import { StockNewsDialog } from "./stock-news-dialog";
import type { TopTradingValueStock, StockNews } from "@year-planner/types";

interface TopTradingValueProps {
  stocks: TopTradingValueStock[];
  news: StockNews[];
}

function formatTradingValue(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}조`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}천억`;
  return `${value}억`;
}

function StockRow({
  stock,
  news,
}: {
  stock: TopTradingValueStock;
  news: StockNews[];
}) {
  const isPositive = stock.changePercent >= 0;

  return (
    <StockNewsDialog
      stockCode={stock.stockCode}
      stockName={stock.stockName}
      news={news}
    >
      <tr className="border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-colors">
        <td className="py-2 pr-2 text-sm text-muted-foreground">{stock.rank}</td>
        <td className="py-2">
          <div className="font-medium text-sm">{stock.stockName}</div>
          <div className="text-xs text-muted-foreground">{stock.stockCode}</div>
        </td>
        <td className="py-2 text-right">
          <div className="font-medium text-sm">{formatPrice(stock.closePrice)}</div>
        </td>
        <td
          className={cn(
            "py-2 text-right",
            isPositive ? "text-red-500" : "text-blue-500"
          )}
        >
          <span className="font-medium text-sm">
            {formatPercent(stock.changePercent)}
          </span>
        </td>
        <td className="py-2 text-right text-sm text-muted-foreground">
          {formatTradingValue(stock.tradingValue)}
        </td>
      </tr>
    </StockNewsDialog>
  );
}

export function TopTradingValueCard({ stocks, news }: TopTradingValueProps) {
  const kospiStocks = stocks.filter((s) => s.market === "KOSPI");
  const kosdaqStocks = stocks.filter((s) => s.market === "KOSDAQ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">거래대금 상위 종목</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="kospi">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kospi">KOSPI</TabsTrigger>
            <TabsTrigger value="kosdaq">KOSDAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="kospi">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="pb-2 text-left w-8">#</th>
                    <th className="pb-2 text-left">종목</th>
                    <th className="pb-2 text-right">현재가</th>
                    <th className="pb-2 text-right">등락률</th>
                    <th className="pb-2 text-right">거래대금</th>
                  </tr>
                </thead>
                <tbody>
                  {kospiStocks.slice(0, 20).map((stock) => (
                    <StockRow key={stock.id} stock={stock} news={news} />
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="kosdaq">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="pb-2 text-left w-8">#</th>
                    <th className="pb-2 text-left">종목</th>
                    <th className="pb-2 text-right">현재가</th>
                    <th className="pb-2 text-right">등락률</th>
                    <th className="pb-2 text-right">거래대금</th>
                  </tr>
                </thead>
                <tbody>
                  {kosdaqStocks.slice(0, 20).map((stock) => (
                    <StockRow key={stock.id} stock={stock} news={news} />
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/stock/src/components/dashboard/top-trading-value.tsx
git commit -m "feat(stock): add TopTradingValueCard component"
```

---

## Task 15: TopVolume 컴포넌트 수정

**Files:**
- Modify: `apps/stock/src/components/dashboard/top-volume.tsx`

- [ ] **Step 1: StockNewsDialog 연동 및 20개 표시**

기존 `StockRow` 컴포넌트를 수정:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, formatPercent, formatVolume, cn } from "@/lib/utils";
import { StockNewsDialog } from "./stock-news-dialog";
import type { TopVolumeStock, StockNews } from "@year-planner/types";

interface TopVolumeProps {
  stocks: TopVolumeStock[];
  news: StockNews[];  // 추가
}

function StockRow({ stock, news }: { stock: TopVolumeStock; news: StockNews[] }) {
  const isPositive = stock.changePercent >= 0;

  return (
    <StockNewsDialog
      stockCode={stock.stockCode}
      stockName={stock.stockName}
      news={news}
    >
      <tr className="border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-colors">
        <td className="py-2 pr-2 text-sm text-muted-foreground">{stock.rank}</td>
        <td className="py-2">
          <div className="font-medium text-sm">{stock.stockName}</div>
          <div className="text-xs text-muted-foreground">{stock.stockCode}</div>
        </td>
        <td className="py-2 text-right">
          <div className="font-medium text-sm">{formatPrice(stock.closePrice)}</div>
        </td>
        <td
          className={cn(
            "py-2 text-right",
            isPositive ? "text-red-500" : "text-blue-500"
          )}
        >
          <span className="font-medium text-sm">
            {formatPercent(stock.changePercent)}
          </span>
        </td>
        <td className="py-2 text-right text-sm text-muted-foreground">
          {formatVolume(stock.volume)}
        </td>
      </tr>
    </StockNewsDialog>
  );
}

export function TopVolumeCard({ stocks, news }: TopVolumeProps) {
  const kospiStocks = stocks.filter((s) => s.market === "KOSPI");
  const kosdaqStocks = stocks.filter((s) => s.market === "KOSDAQ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">거래량 상위 종목</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="kospi">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kospi">KOSPI</TabsTrigger>
            <TabsTrigger value="kosdaq">KOSDAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="kospi">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="pb-2 text-left w-8">#</th>
                    <th className="pb-2 text-left">종목</th>
                    <th className="pb-2 text-right">현재가</th>
                    <th className="pb-2 text-right">등락률</th>
                    <th className="pb-2 text-right">거래량</th>
                  </tr>
                </thead>
                <tbody>
                  {kospiStocks.slice(0, 20).map((stock) => (
                    <StockRow key={stock.id} stock={stock} news={news} />
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="kosdaq">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="pb-2 text-left w-8">#</th>
                    <th className="pb-2 text-left">종목</th>
                    <th className="pb-2 text-right">현재가</th>
                    <th className="pb-2 text-right">등락률</th>
                    <th className="pb-2 text-right">거래량</th>
                  </tr>
                </thead>
                <tbody>
                  {kosdaqStocks.slice(0, 20).map((stock) => (
                    <StockRow key={stock.id} stock={stock} news={news} />
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/stock/src/components/dashboard/top-volume.tsx
git commit -m "feat(stock): update TopVolumeCard to show 20 items with news dialog"
```

---

## Task 16: API 클라이언트 업데이트

**Files:**
- Modify: `apps/stock/src/lib/api.ts`

- [ ] **Step 1: 새 API 메서드 추가**

```typescript
import type {
  DailyStockSummary,
  MarketIndex,
  SectorPerformance,
  TopVolumeStock,
  TopTradingValueStock,
  StockMover,
  InvestorTrading,
  StockNews,
  CrawlResponse,
} from "@year-planner/types";

// ... 기존 코드 ...

export const stockApi = {
  // ... 기존 메서드들 ...

  getTopTradingValueStocks: (date?: string): Promise<TopTradingValueStock[]> =>
    fetchApi<TopTradingValueStock[]>(
      date ? `/api/stock/top-trading-value?date=${date}` : "/api/stock/top-trading-value"
    ),

  getLatestNews: (): Promise<StockNews[]> =>
    fetchApi<StockNews[]>("/api/stock/news/latest"),

  getNewsByStock: (stockCode: string): Promise<StockNews[]> =>
    fetchApi<StockNews[]>(`/api/stock/news/${stockCode}`),

  triggerNewsCrawl: (date?: string): Promise<{ success: boolean; message: string; count: number }> =>
    fetchApi<{ success: boolean; message: string; count: number }>(
      date ? `/api/stock/crawl/news?date=${date}` : "/api/stock/crawl/news",
      { method: "POST" }
    ),
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/stock/src/lib/api.ts
git commit -m "feat(stock): add API methods for news and trading value"
```

---

## Task 17: React Query Hooks 업데이트

**Files:**
- Modify: `apps/stock/src/hooks/use-stock.ts`

- [ ] **Step 1: 새 hooks 추가**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockApi } from "@/lib/api";

// ... 기존 hooks ...

export function useTopTradingValue() {
  return useQuery({
    queryKey: ["topTradingValue"],
    queryFn: () => stockApi.getTopTradingValueStocks(),
  });
}

export function useLatestNews() {
  return useQuery({
    queryKey: ["latestNews"],
    queryFn: () => stockApi.getLatestNews(),
  });
}

export function useStockNews(stockCode: string) {
  return useQuery({
    queryKey: ["stockNews", stockCode],
    queryFn: () => stockApi.getNewsByStock(stockCode),
    enabled: !!stockCode,
  });
}

export function useTriggerNewsCrawl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date?: string) => stockApi.triggerNewsCrawl(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latestNews"] });
      queryClient.invalidateQueries({ queryKey: ["stockSummary"] });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/stock/src/hooks/use-stock.ts
git commit -m "feat(stock): add React Query hooks for news and trading value"
```

---

## Task 18: Dashboard 페이지 통합

**Files:**
- Modify: `apps/stock/src/app/page.tsx`

- [ ] **Step 1: 새 컴포넌트 import 및 사용**

```tsx
"use client";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { IndexCard } from "@/components/dashboard/index-card";
import { SectorHeatmap } from "@/components/dashboard/sector-heatmap";
import { MoversTable } from "@/components/dashboard/movers-table";
import { InvestorTradingCard } from "@/components/dashboard/investor-trading";
import { TopVolumeCard } from "@/components/dashboard/top-volume";
import { TopTradingValueCard } from "@/components/dashboard/top-trading-value";
import { StockNewsCard } from "@/components/dashboard/stock-news-card";
import { FilterBar } from "@/components/dashboard/filter-bar";

import { useStockSummary, useTriggerCrawl, useTriggerNewsCrawl } from "@/hooks/use-stock";

export default function DashboardPage() {
  const { data: summary, isLoading, error, refetch } = useStockSummary();
  const crawlMutation = useTriggerCrawl();
  const newsCrawlMutation = useTriggerNewsCrawl();

  const handleCrawl = async () => {
    try {
      const result = await crawlMutation.mutateAsync();
      if (result.success) {
        toast.success(`${result.date} 데이터 수집 완료`);
        // 시세 수집 후 뉴스 수집
        const newsResult = await newsCrawlMutation.mutateAsync();
        if (newsResult.success) {
          toast.success(`${newsResult.count}개 뉴스 수집 완료`);
        }
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("데이터 수집 중 오류가 발생했습니다");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          데이터가 없습니다. 크롤링을 실행해주세요.
        </p>
        <Button
          onClick={handleCrawl}
          disabled={crawlMutation.isPending || newsCrawlMutation.isPending}
        >
          {crawlMutation.isPending || newsCrawlMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              수집 중...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              데이터 수집
            </>
          )}
        </Button>
      </div>
    );
  }

  const formattedDate = format(new Date(summary.date), "yyyy년 M월 d일 (EEE)", {
    locale: ko,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">{formattedDate} 시장 요약</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCrawl}
          disabled={crawlMutation.isPending || newsCrawlMutation.isPending}
        >
          {crawlMutation.isPending || newsCrawlMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              수집 중...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </>
          )}
        </Button>
      </div>

      {/* 필터 바 */}
      <FilterBar />

      {/* 지수 카드 */}
      <div className="grid gap-4 md:grid-cols-2">
        {summary.indices.map((index) => (
          <IndexCard key={index.market} index={index} />
        ))}
      </div>

      {/* 섹터 히트맵 */}
      <SectorHeatmap sectors={summary.sectors} />

      {/* 투자자별 매매 동향 */}
      <InvestorTradingCard trading={summary.investorTrading} />

      {/* 급등/급락 종목 */}
      <MoversTable gainers={summary.gainers} losers={summary.losers} />

      {/* 거래량 상위 */}
      <TopVolumeCard stocks={summary.topVolume} news={summary.news} />

      {/* 거래대금 상위 */}
      <TopTradingValueCard stocks={summary.topTradingValue} news={summary.news} />

      {/* 오늘의 주요 뉴스 */}
      <StockNewsCard news={summary.news} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/stock/src/app/page.tsx
git commit -m "feat(stock): integrate all new components into dashboard"
```

---

## Task 19: 빌드 및 테스트

**Files:**
- All files

- [ ] **Step 1: 패키지 빌드**

```bash
pnpm build
```

Expected: 모든 패키지 빌드 성공

- [ ] **Step 2: API 서버 실행**

```bash
cd apps/api && pnpm dev
```

Expected: NestJS 서버 정상 실행

- [ ] **Step 3: 프론트엔드 실행**

```bash
cd apps/stock && pnpm dev
```

Expected: Next.js 서버 정상 실행

- [ ] **Step 4: 수동 크롤링 테스트**

브라우저에서 대시보드 접속 후 "데이터 수집" 버튼 클릭

Expected: 시세 + 뉴스 데이터 수집 성공

- [ ] **Step 5: 최종 Commit**

```bash
git add .
git commit -m "feat: complete stock news feature implementation"
```

---

## 체크리스트

- [ ] Prisma 마이그레이션 완료
- [ ] TypeScript 타입 추가 완료
- [ ] NaverFinanceCrawler 확장 (20개, marketCap)
- [ ] NaverNewsCrawler 생성
- [ ] Repository 메서드 추가
- [ ] Service 메서드 추가
- [ ] Controller 엔드포인트 추가
- [ ] Scheduler 업데이트
- [ ] FilterBar 컴포넌트 생성
- [ ] StockNewsDialog 컴포넌트 생성
- [ ] StockNewsCard 컴포넌트 생성
- [ ] TopTradingValueCard 컴포넌트 생성
- [ ] TopVolumeCard 수정
- [ ] Dashboard 페이지 통합
- [ ] 빌드 및 테스트 완료
