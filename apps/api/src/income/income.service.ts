import { Injectable, NotFoundException } from '@nestjs/common';
import { IncomeRepository } from './income.repository';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomeService {
  constructor(private incomeRepository: IncomeRepository) {}

  async findAll() {
    return this.incomeRepository.findAll();
  }

  async findById(id: string) {
    const income = await this.incomeRepository.findById(id);
    if (!income) {
      throw new NotFoundException(`Income with id ${id} not found`);
    }
    return income;
  }

  async create(data: CreateIncomeDto) {
    return this.incomeRepository.create(data);
  }

  async update(id: string, data: UpdateIncomeDto) {
    await this.findById(id);
    return this.incomeRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.incomeRepository.delete(id);
  }
}
