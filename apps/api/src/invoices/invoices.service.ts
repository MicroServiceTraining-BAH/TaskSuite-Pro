import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(companyId: string, createInvoiceDto: CreateInvoiceDto) {
    const invoice = await this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        companyId,
      },
      include: { client: true, job: true },
    });

    // Send email notification if client has email and portal access
    if (invoice.client.email && invoice.client.hasPortalAccess) {
      await this.emailService.sendInvoiceNotification(
        invoice.client.email,
        invoice.invoiceNumber,
        invoice.amount,
        invoice.dueDate || undefined
      );
    }

    return invoice;
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { client: true, job: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { client: true, job: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(id: string, companyId: string, updateInvoiceDto: UpdateInvoiceDto) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.update({
      where: { id },
      data: updateInvoiceDto,
      include: { client: true, job: true },
    });
  }

  async markPaid(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
      include: { client: true, job: true },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}

