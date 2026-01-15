import { Injectable } from '@nestjs/common';
import type { Task, TaskStatus } from '@year-planner/types';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksRepository {
  private tasks: Map<string, Task> = new Map();

  create(dto: CreateTaskDto, userId: string): Task {
    const now = new Date();
    const task: Task = {
      id: uuidv4(),
      planId: dto.planId,
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: 'todo' as TaskStatus,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  findAll(userId: string): Task[] {
    return Array.from(this.tasks.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findByDate(userId: string, date: string): Task[] {
    const targetDate = new Date(date);
    return this.findAll(userId).filter((t) => {
      if (!t.dueDate) return false;
      return (
        t.dueDate.getFullYear() === targetDate.getFullYear() &&
        t.dueDate.getMonth() === targetDate.getMonth() &&
        t.dueDate.getDate() === targetDate.getDate()
      );
    });
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  update(id: string, dto: UpdateTaskDto): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updated: Task = {
      ...task,
      title: dto.title ?? task.title,
      description: dto.description ?? task.description,
      status: dto.status ?? task.status,
      dueDate:
        dto.dueDate === null
          ? undefined
          : dto.dueDate
            ? new Date(dto.dueDate)
            : task.dueDate,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
