import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GoalsModule } from './goals/goals.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { IncomeModule } from './income/income.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    GoalsModule,
    TasksModule,
    IncomeModule,
    StockModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
