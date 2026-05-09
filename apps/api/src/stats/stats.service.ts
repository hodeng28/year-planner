import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const trades = await this.prisma.trade.findMany({
      orderBy: [{ stockCode: 'asc' }, { tradedAt: 'asc' }],
    });

    const pairings = this.calculatePairings(trades);
    const wins = pairings.filter((p) => p.profit > 0).length;
    const losses = pairings.filter((p) => p.profit < 0).length;
    const totalProfit = pairings.reduce((sum, p) => sum + p.profit, 0);

    return {
      totalTrades: trades.length,
      totalProfit,
      winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0,
      wins,
      losses,
    };
  }

  async getMonthly() {
    const trades = await this.prisma.trade.findMany({
      orderBy: [{ stockCode: 'asc' }, { tradedAt: 'asc' }],
    });
    const pairings = this.calculatePairings(trades);

    const monthly: Record<string, number> = {};
    pairings.forEach((p) => {
      const month = p.sellDate.substring(0, 7);
      monthly[month] = (monthly[month] || 0) + p.profit;
    });

    return Object.entries(monthly)
      .map(([month, profit]) => ({ month, profit }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculatePairings(trades: any[]) {
    const buyQueue: Record<string, any[]> = {};
    const pairings: any[] = [];

    trades.forEach((trade) => {
      if (trade.type === 'BUY') {
        if (!buyQueue[trade.stockCode]) buyQueue[trade.stockCode] = [];
        buyQueue[trade.stockCode].push({ ...trade, remainingQty: trade.quantity });
      } else if (trade.type === 'SELL') {
        let sellQty = trade.quantity;
        const queue = buyQueue[trade.stockCode] || [];

        while (sellQty > 0 && queue.length > 0) {
          const buy = queue[0];
          const matchQty = Math.min(sellQty, buy.remainingQty);
          const profit = (trade.price - buy.price) * matchQty;

          pairings.push({
            stockCode: trade.stockCode,
            buyPrice: buy.price,
            sellPrice: trade.price,
            quantity: matchQty,
            profit,
            sellDate: trade.tradedAt.toISOString(),
            emotionId: trade.emotionId,
            patternId: trade.patternId,
            strategyId: trade.strategyId,
          });

          buy.remainingQty -= matchQty;
          sellQty -= matchQty;
          if (buy.remainingQty === 0) queue.shift();
        }
      }
    });

    return pairings;
  }
}
