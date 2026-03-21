import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Injectable()
export class ServiceTypesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateServiceTypeDto) {
    return this.prisma.serviceType.create({
      data: { ...dto, companyId },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.serviceType.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const st = await this.prisma.serviceType.findFirst({ where: { id, companyId } });
    if (!st) throw new NotFoundException(`ServiceType ${id} not found`);
    return st;
  }

  async update(id: string, companyId: string, dto: UpdateServiceTypeDto) {
    await this.findOne(id, companyId);
    return this.prisma.serviceType.update({ where: { id }, data: dto });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.serviceType.delete({ where: { id } });
  }
}
