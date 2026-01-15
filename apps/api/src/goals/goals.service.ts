import { Injectable, NotFoundException } from '@nestjs/common';
import { Goal } from '@year-planner/types';
import { GoalsRepository } from './goals.repository';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  // MVP: 임시 userId (나중에 JWT에서 추출)
  private readonly tempUserId = 'user-1';

  constructor(private readonly repository: GoalsRepository) {}

  create(dto: CreateGoalDto): Goal {
    return this.repository.create(dto, this.tempUserId);
  }

  findAll(): Goal[] {
    return this.repository.findAll(this.tempUserId);
  }

  findOne(id: string): Goal {
    const goal = this.repository.findById(id);
    if (!goal) {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
    return goal;
  }

  update(id: string, dto: UpdateGoalDto): Goal {
    const updated = this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
    return updated;
  }

  remove(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
  }
}
