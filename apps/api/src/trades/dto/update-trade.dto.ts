import { TradeType } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsInt,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UpdateTradeDto {
  @IsOptional()
  @IsString()
  stockCode?: string;

  @IsOptional()
  @IsString()
  stockName?: string;

  @IsOptional()
  @IsEnum(TradeType)
  type?: TradeType;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsDateString()
  tradedAt?: string;

  @IsOptional()
  @IsInt()
  targetPrice?: number;

  @IsOptional()
  @IsInt()
  stopLossPrice?: number;

  @IsOptional()
  @IsUUID()
  emotionId?: string;

  @IsOptional()
  @IsUUID()
  patternId?: string;

  @IsOptional()
  @IsUUID()
  strategyId?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}
