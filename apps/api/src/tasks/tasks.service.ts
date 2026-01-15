import { Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '@year-planner/types';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  // MVP: 임시 userId
  private readonly tempUserId = 'user-1';

  constructor(private readonly repository: TasksRepository) {}

  create(dto: CreateTaskDto): Task {
    return this.repository.create(dto, this.tempUserId);
  }

  findAll(): Task[] {
    return this.repository.findAll(this.tempUserId);
  }

  findByDate(date: string): Task[] {
    return this.repository.findByDate(this.tempUserId, date);
  }

  findOne(id: string): Task {
    const task = this.repository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const updated = this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return updated;
  }

  remove(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }
}
