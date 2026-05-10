import { TradeType } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsInt,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateTradeDto {
  @IsString()
  stockCode: string;

  @IsString()
  stockName: string;

  @IsEnum(TradeType)
  type: TradeType;

  @IsInt()
  price: number;

  @IsInt()
  quantity: number;

  @IsDateString()
  tradedAt: string;

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
