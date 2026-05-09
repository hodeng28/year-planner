import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

@Injectable()
export class TradesService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: {
    startDate?: string;
    endDate?: string;
    stockCode?: string;
    type?: string;
  }) {
    const where: any = {};
    if (params?.startDate && params?.endDate) {
      where.tradedAt = {
        gte: new Date(params.startDate),
        lte: new Date(params.endDate),
      };
    }
    if (params?.stockCode) {
      where.stockCode = params.stockCode;
    }
    if (params?.type) {
      where.type = params.type;
    }
    return this.prisma.trade.findMany({
      where,
      include: { emotion: true, pattern: true, strategy: true },
      orderBy: { tradedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.trade.findUnique({
      where: { id },
      include: { emotion: true, pattern: true, strategy: true },
    });
  }

  create(dto: CreateTradeDto) {
    return this.prisma.trade.create({
      data: {
        ...dto,
        tradedAt: new Date(dto.tradedAt),
      },
      include: { emotion: true, pattern: true, strategy: true },
    });
  }

  update(id: string, dto: UpdateTradeDto) {
    return this.prisma.trade.update({
      where: { id },
      data: {
        ...dto,
        tradedAt: new Date(dto.tradedAt),
      },
      include: { emotion: true, pattern: true, strategy: true },
    });
  }

  delete(id: string) {
    return this.prisma.trade.delete({ where: { id } });
  }
}
