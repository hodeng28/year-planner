import { Module } from '@nestjs/common';
import { GoalsModule } from './goals/goals.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [GoalsModule, TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
