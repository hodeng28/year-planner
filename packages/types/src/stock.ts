// 주식 관련 타입 정의

/**
 * 시장 구분
 */
export type MarketType = 'KOSPI' | 'KOSDAQ';

/**
 * 지수 정보
 */
export interface MarketIndex {
  id: string;
  date: string; // YYYY-MM-DD
  market: MarketType;
  closePrice: number; // 종가
  change: number; // 전일대비 (+/-)
  changePercent: number; // 등락률 (%)
  volume: number; // 거래량
  tradingValue: number; // 거래대금 (억원)
  createdAt: Date;
}

/**
 * 섹터 등락 정보
 */
export interface SectorPerformance {
  id: string;
  date: string;
  sectorName: string; // 섹터 이름
  changePercent: number; // 등락률 (%)
  createdAt: Date;
}

/**
 * 거래량 상위 종목
 */
export interface TopVolumeStock {
  id: string;
  date: string;
  rank: number; // 순위 (1-10)
  stockCode: string; // 종목 코드
  stockName: string; // 종목명
  closePrice: number; // 종가
  change: number; // 전일대비
  changePercent: number; // 등락률 (%)
  volume: number; // 거래량
  market: MarketType;
  createdAt: Date;
}

/**
 * 급등/급락 종목
 */
export type MoverType = 'GAINER' | 'LOSER';

export interface StockMover {
  id: string;
  date: string;
  type: MoverType; // 급등 or 급락
  rank: number; // 순위 (1-10)
  stockCode: string;
  stockName: string;
  closePrice: number;
  change: number;
  changePercent: number;
  volume: number;
  market: MarketType;
  createdAt: Date;
}

/**
 * 투자자별 매매 동향
 */
export type InvestorType = 'FOREIGN' | 'INSTITUTION';

export interface InvestorTrading {
  id: string;
  date: string;
  investorType: InvestorType;
  market: MarketType;
  buyAmount: number; // 매수금액 (억원)
  sellAmount: number; // 매도금액 (억원)
  netAmount: number; // 순매수금액 (억원)
  createdAt: Date;
}

/**
 * 일일 종합 요약
 */
export interface DailyStockSummary {
  date: string;
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  topVolume: TopVolumeStock[];
  gainers: StockMover[];
  losers: StockMover[];
  investorTrading: InvestorTrading[];
}

/**
 * API 응답 타입
 */
export interface StockSummaryResponse {
  success: boolean;
  data: DailyStockSummary;
}

export interface StockListResponse<T> {
  success: boolean;
  data: T[];
}

/**
 * 크롤링 요청 타입
 */
export interface CrawlRequest {
  date?: string; // YYYY-MM-DD, 미제공시 전날
}

export interface CrawlResponse {
  success: boolean;
  message: string;
  date: string;
}
