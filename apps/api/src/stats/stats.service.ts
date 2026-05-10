import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class StatsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async getSummary() {
    const trades = await this.prisma.trade.findMany({
      orderBy: [{ stockCode: 'asc' }, { tradedAt: 'asc' }],
    });
    const feeSettings = await this.settingsService.getFeeSettings();

    const pairings = this.calculatePairings(trades, feeSettings);
    const wins = pairings.filter((p) => p.netProfit > 0).length;
    const losses = pairings.filter((p) => p.netProfit < 0).length;
    const totalProfit = pairings.reduce((sum, p) => sum + p.profit, 0);
    const totalFees = pairings.reduce((sum, p) => sum + p.totalFee, 0);
    const totalNetProfit = pairings.reduce((sum, p) => sum + p.netProfit, 0);

    return {
      totalTrades: trades.length,
      totalProfit,        // 세전 수익
      totalFees,          // 총 수수료
      totalNetProfit,     // 세후 순수익
      winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0,
      wins,
      losses,
      feeSettings: {
        buyCommission: feeSettings.buyCommission,
        sellCommission: feeSettings.sellCommission,
        transactionTax: feeSettings.transactionTax,
      },
    };
  }

  async getMonthly() {
    const trades = await this.prisma.trade.findMany({
      orderBy: [{ stockCode: 'asc' }, { tradedAt: 'asc' }],
    });
    const feeSettings = await this.settingsService.getFeeSettings();
    const pairings = this.calculatePairings(trades, feeSettings);

    const monthly: Record<string, { profit: number; netProfit: number; fees: number }> = {};
    pairings.forEach((p) => {
      const month = p.sellDate.substring(0, 7);
      if (!monthly[month]) {
        monthly[month] = { profit: 0, netProfit: 0, fees: 0 };
      }
      monthly[month].profit += p.profit;
      monthly[month].netProfit += p.netProfit;
      monthly[month].fees += p.totalFee;
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculatePairings(trades: any[], feeSettings: any) {
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

          const buyAmount = buy.price * matchQty;
          const sellAmount = trade.price * matchQty;
          const profit = sellAmount - buyAmount;

          // 수수료 계산
          const buyFee = Math.floor(buyAmount * feeSettings.buyCommission);
          const sellFee = Math.floor(sellAmount * feeSettings.sellCommission);
          const taxFee = Math.floor(sellAmount * feeSettings.transactionTax);
          const totalFee = buyFee + sellFee + taxFee;
          const netProfit = profit - totalFee;

          pairings.push({
            stockCode: trade.stockCode,
            buyPrice: buy.price,
            sellPrice: trade.price,
            quantity: matchQty,
            profit,
            buyFee,
            sellFee,
            taxFee,
            totalFee,
            netProfit,
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
