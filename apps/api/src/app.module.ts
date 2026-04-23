import { Module } from '@nestjs/common';
import { GoalsModule } from './goals/goals.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { IncomeModule } from './income/income.module';

@Module({
  imports: [PrismaModule, GoalsModule, TasksModule, IncomeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
