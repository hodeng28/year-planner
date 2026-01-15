import {
  IsString,
  IsOptional,
  MaxLength,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateTaskDto {
  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsString()
  @MaxLength(80)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
