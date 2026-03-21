import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';

@Injectable()
export class TaxRatesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createTaxRateDto: CreateTaxRateDto) {
    return this.prisma.taxRate.create({
      data: {
        ...createTaxRateDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string, isActive?: boolean) {
    const where: any = { companyId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.prisma.taxRate.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const taxRate = await this.prisma.taxRate.findFirst({
      where: { id, companyId },
    });
    if (!taxRate) {
      throw new NotFoundException(`Tax rate with ID ${id} not found`);
    }
    return taxRate;
  }

  async update(id: string, companyId: string, updateTaxRateDto: UpdateTaxRateDto) {
    await this.findOne(id, companyId);
    return this.prisma.taxRate.update({
      where: { id },
      data: updateTaxRateDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.taxRate.delete({
      where: { id },
    });
  }

  async getDefaultRate(companyId: string) {
    const defaultRate = await this.prisma.taxRate.findFirst({
      where: { companyId, isDefault: true, isActive: true },
    });
    return defaultRate;
  }
}

