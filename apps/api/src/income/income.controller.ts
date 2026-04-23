import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Controller('income')
export class IncomeController {
  constructor(private incomeService: IncomeService) {}

  @Get()
  async findAll() {
    return this.incomeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.incomeService.findById(id);
  }

  @Post()
  async create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomeService.update(id, updateIncomeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.incomeService.delete(id);
  }
}
