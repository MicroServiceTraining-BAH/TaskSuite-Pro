import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createBillDto: CreateBillDto) {
    const dueDate = new Date(createBillDto.dueDate);
    const status = createBillDto.status || 'unpaid';
    
    // Check if bill is overdue
    const finalStatus = status === 'unpaid' && dueDate < new Date() ? 'overdue' : status;
    
    return this.prisma.bill.create({
      data: {
        ...createBillDto,
        companyId,
        dueDate,
        status: finalStatus,
      },
      include: { account: true },
    });
  }

  async findAll(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }
    return this.prisma.bill.findMany({
      where,
      include: { account: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const bill = await this.prisma.bill.findFirst({
      where: { id, companyId },
      include: { account: true },
    });
    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }
    return bill;
  }

  async update(id: string, companyId: string, updateBillDto: UpdateBillDto) {
    await this.findOne(id, companyId);
    const data: any = { ...updateBillDto };
    
    if (updateBillDto.dueDate) {
      data.dueDate = new Date(updateBillDto.dueDate);
    }
    
    // Auto-update status to overdue if unpaid and past due date
    if (data.status === 'unpaid' || (!data.status && updateBillDto.dueDate)) {
      const dueDate = data.dueDate || (await this.findOne(id, companyId)).dueDate;
      if (dueDate < new Date()) {
        data.status = 'overdue';
      }
    }
    
    // If marking as paid, set paidAt
    if (data.status === 'paid') {
      const currentBill = await this.findOne(id, companyId);
      if (currentBill.status !== 'paid') {
        data.paidAt = new Date();
      }
    }
    
    // If marking as unpaid, clear paidAt
    if (data.status === 'unpaid') {
      data.paidAt = null;
    }

    return this.prisma.bill.update({
      where: { id },
      data,
      include: { account: true },
    });
  }

  async markPaid(id: string, companyId: string, paymentMethod?: string) {
    const bill = await this.findOne(id, companyId);
    if (bill.status === 'paid') {
      throw new BadRequestException('Bill is already marked as paid');
    }
    
    return this.prisma.bill.update({
      where: { id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: paymentMethod || bill.paymentMethod,
      },
      include: { account: true },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.bill.delete({
      where: { id },
    });
  }

  async updateOverdueBills(companyId: string) {
    const now = new Date();
    const result = await this.prisma.bill.updateMany({
      where: {
        companyId,
        status: 'unpaid',
        dueDate: { lt: now },
      },
      data: {
        status: 'overdue',
      },
    });
    return { updated: result.count };
  }
}

