import { TradeType } from '@prisma/client';

export class CreateTradeDto {
  stockCode: string;
  stockName: string;
  type: TradeType;
  price: number;
  quantity: number;
  tradedAt: Date;
  targetPrice?: number;
  stopLossPrice?: number;
  emotionId?: string;
  patternId?: string;
  strategyId?: string;
  memo?: string;
}
