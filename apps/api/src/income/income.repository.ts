import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomeRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.income.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.income.findUnique({
      where: { id },
    });
  }

  async create(data: CreateIncomeDto) {
    return this.prisma.income.create({
      data,
    });
  }

  async update(id: string, data: UpdateIncomeDto) {
    return this.prisma.income.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.income.delete({
      where: { id },
    });
  }
}
