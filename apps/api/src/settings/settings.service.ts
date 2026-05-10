import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getFeeSettings() {
    let settings = await this.prisma.feeSettings.findUnique({
      where: { id: 'default' },
    });

    // 기본값 생성
    if (!settings) {
      settings = await this.prisma.feeSettings.create({
        data: {
          id: 'default',
          buyCommission: 0.00015,   // 0.015%
          sellCommission: 0.00015,  // 0.015%
          transactionTax: 0.002,    // 0.20%
        },
      });
    }

    return settings;
  }

  async updateFeeSettings(data: {
    buyCommission?: number;
    sellCommission?: number;
    transactionTax?: number;
  }) {
    return this.prisma.feeSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: {
        id: 'default',
        ...data,
      },
    });
  }
}
