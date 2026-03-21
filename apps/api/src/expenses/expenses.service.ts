import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createExpenseDto: CreateExpenseDto) {
    const date = createExpenseDto.date ? new Date(createExpenseDto.date) : new Date();
    return this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        companyId,
        date,
      },
      include: { account: true },
    });
  }

  async findAll(companyId: string, startDate?: string, endDate?: string, accountId?: string) {
    const where: any = { companyId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (accountId) {
      where.accountId = accountId;
    }

    return this.prisma.expense.findMany({
      where,
      include: { account: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, companyId },
      include: { account: true },
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: string, companyId: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id, companyId);
    const data: any = { ...updateExpenseDto };
    if (updateExpenseDto.date) {
      data.date = new Date(updateExpenseDto.date);
    }
    return this.prisma.expense.update({
      where: { id },
      data,
      include: { account: true },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.expense.delete({
      where: { id },
    });
  }

  async getTotalByAccount(companyId: string, startDate?: string, endDate?: string) {
    const expenses = await this.findAll(companyId, startDate, endDate);
    const totals: Record<string, { accountName: string; total: number }> = {};
    
    expenses.forEach(expense => {
      const key = expense.accountId || 'uncategorized';
      if (!totals[key]) {
        totals[key] = {
          accountName: expense.account?.name || 'Uncategorized',
          total: 0,
        };
      }
      totals[key].total += expense.amount;
    });
    
    return Object.values(totals);
  }
}

