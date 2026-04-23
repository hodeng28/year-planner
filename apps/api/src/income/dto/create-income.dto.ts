import { IsString, IsNumber, IsOptional, IsIn, Min, Matches } from 'class-validator';

export class CreateIncomeDto {
  @IsIn(['event', 'survey', 'experience'])
  category: 'event' | 'survey' | 'experience';

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  date: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  memo?: string;
}
