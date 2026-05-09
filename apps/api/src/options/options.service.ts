import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OptionsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    const emotions = ['침착', '불안', '탐욕', '공포', 'FOMO'];
    const patterns = ['돌파', '눌림목', '쌍바닥', '역헤드앤숄더', '박스권', '추세선이탈'];
    const strategies = ['스윙', '단타', '추세추종', '역추세', '이벤트'];

    for (const name of emotions) {
      await this.prisma.emotionOption.upsert({
        where: { name },
        update: {},
        create: { name, isDefault: true },
      });
    }
    for (const name of patterns) {
      await this.prisma.patternOption.upsert({
        where: { name },
        update: {},
        create: { name, isDefault: true },
      });
    }
    for (const name of strategies) {
      await this.prisma.strategyOption.upsert({
        where: { name },
        update: {},
        create: { name, isDefault: true },
      });
    }
  }

  findAllEmotions() {
    return this.prisma.emotionOption.findMany({ orderBy: { createdAt: 'asc' } });
  }

  createEmotion(name: string) {
    return this.prisma.emotionOption.create({ data: { name } });
  }

  deleteEmotion(id: string) {
    return this.prisma.emotionOption.delete({ where: { id } });
  }

  findAllPatterns() {
    return this.prisma.patternOption.findMany({ orderBy: { createdAt: 'asc' } });
  }

  createPattern(name: string) {
    return this.prisma.patternOption.create({ data: { name } });
  }

  deletePattern(id: string) {
    return this.prisma.patternOption.delete({ where: { id } });
  }

  findAllStrategies() {
    return this.prisma.strategyOption.findMany({ orderBy: { createdAt: 'asc' } });
  }

  createStrategy(name: string) {
    return this.prisma.strategyOption.create({ data: { name } });
  }

  deleteStrategy(id: string) {
    return this.prisma.strategyOption.delete({ where: { id } });
  }
}
