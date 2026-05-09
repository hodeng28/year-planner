import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stockCode') stockCode?: string,
    @Query('type') type?: string,
  ) {
    return this.tradesService.findAll({ startDate, endDate, stockCode, type });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTradeDto) {
    return this.tradesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTradeDto) {
    return this.tradesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tradesService.delete(id);
  }
}
