import { IsOptional, IsDateString } from 'class-validator';

export class TaskQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string; // YYYY-MM-DD
}
