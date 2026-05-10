import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateFeeSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1) // 최대 10%
  buyCommission?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  sellCommission?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  transactionTax?: number;
}
