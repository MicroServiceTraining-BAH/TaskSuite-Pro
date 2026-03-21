import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceTemplateDto } from "./dto/create-invoice-template.dto";
import { UpdateInvoiceTemplateDto } from "./dto/update-invoice-template.dto";

@Injectable()
export class InvoiceTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createTemplateDto: CreateInvoiceTemplateDto) {
    return this.prisma.invoiceTemplate.create({
      data: {
        ...createTemplateDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.invoiceTemplate.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const template = await this.prisma.invoiceTemplate.findFirst({
      where: { id, companyId },
    });
    if (!template) {
      throw new NotFoundException(`Invoice template with ID ${id} not found`);
    }
    return template;
  }

  async update(id: string, companyId: string, updateTemplateDto: UpdateInvoiceTemplateDto) {
    await this.findOne(id, companyId);
    return this.prisma.invoiceTemplate.update({
      where: { id },
      data: updateTemplateDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoiceTemplate.delete({
      where: { id },
    });
  }
}

