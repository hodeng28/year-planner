import {
  IsString,
  IsOptional,
  MaxLength,
  IsIn,
  IsDateString,
} from 'class-validator';
import type { TaskStatus } from '@year-planner/types';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(['todo', 'in_progress', 'completed', 'on_hold'])
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}
