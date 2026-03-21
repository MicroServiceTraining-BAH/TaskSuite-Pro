import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createAccountDto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        ...createAccountDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string, type?: string) {
    const where: any = { companyId };
    if (type) {
      where.type = type;
    }
    return this.prisma.account.findMany({
      where,
      orderBy: [{ code: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, companyId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, companyId },
    });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async update(id: string, companyId: string, updateAccountDto: UpdateAccountDto) {
    await this.findOne(id, companyId);
    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.account.delete({
      where: { id },
    });
  }
}

