import { IsString, IsNumber, IsOptional, IsIn, Min, Matches } from 'class-validator';

export class UpdateIncomeDto {
  @IsOptional()
  @IsIn(['event', 'survey', 'experience'])
  category?: 'event' | 'survey' | 'experience';

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  memo?: string;
}
