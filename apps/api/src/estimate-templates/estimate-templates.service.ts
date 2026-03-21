import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEstimateTemplateDto } from "./dto/create-estimate-template.dto";
import { UpdateEstimateTemplateDto } from "./dto/update-estimate-template.dto";

@Injectable()
export class EstimateTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createTemplateDto: CreateEstimateTemplateDto) {
    return this.prisma.estimateTemplate.create({
      data: {
        ...createTemplateDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.estimateTemplate.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const template = await this.prisma.estimateTemplate.findFirst({
      where: { id, companyId },
    });
    if (!template) {
      throw new NotFoundException(`Estimate template with ID ${id} not found`);
    }
    return template;
  }

  async update(id: string, companyId: string, updateTemplateDto: UpdateEstimateTemplateDto) {
    await this.findOne(id, companyId);
    return this.prisma.estimateTemplate.update({
      where: { id },
      data: updateTemplateDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.estimateTemplate.delete({
      where: { id },
    });
  }
}

