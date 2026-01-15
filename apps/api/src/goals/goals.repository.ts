import { Injectable } from '@nestjs/common';
import { Goal } from '@year-planner/types';
import { v4 as uuidv4 } from 'uuid';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsRepository {
  private goals: Map<string, Goal> = new Map();

  create(dto: CreateGoalDto, userId: string): Goal {
    const now = new Date();
    const goal: Goal = {
      id: uuidv4(),
      title: dto.title,
      description: dto.description,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    this.goals.set(goal.id, goal);
    return goal;
  }

  findAll(userId: string): Goal[] {
    return Array.from(this.goals.values())
      .filter((g) => g.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findById(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  update(id: string, dto: UpdateGoalDto): Goal | undefined {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const updated: Goal = {
      ...goal,
      ...dto,
      updatedAt: new Date(),
    };
    this.goals.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.goals.delete(id);
  }
}
