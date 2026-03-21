import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { EmailService } from "../email/email.service";
import { SmsService } from "../sms/sms.service";

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  async create(companyId: string, createInvoiceDto: CreateInvoiceDto) {
    let amount = createInvoiceDto.amount || 0;
    const taxRate = createInvoiceDto.taxRate || 0;

    // Calculate amount from line items if provided
    if (createInvoiceDto.lineItems && createInvoiceDto.lineItems.length > 0) {
      amount = createInvoiceDto.lineItems.reduce((total, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTax = itemTotal * (item.taxRate || taxRate);
        return total + itemTotal + itemTax;
      }, 0);
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        clientId: createInvoiceDto.clientId,
        jobId: createInvoiceDto.jobId,
        invoiceNumber: createInvoiceDto.invoiceNumber,
        amount,
        taxRate,
        dueDate: createInvoiceDto.dueDate,
        status: createInvoiceDto.status,
        companyId,
      },
      include: { client: true, job: true, lineItems: true },
    });

    // Create line items if provided
    if (createInvoiceDto.lineItems && createInvoiceDto.lineItems.length > 0) {
      await Promise.all(
        createInvoiceDto.lineItems.map((item) =>
          this.prisma.invoiceLineItem.create({
            data: {
              invoiceId: invoice.id,
              companyId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate || taxRate,
            },
          })
        )
      );
    }

    // Reload invoice with line items
    const invoiceWithItems = await this.findOne(invoice.id, companyId);

    // Send email notification if requested and client has email
    if (createInvoiceDto.sendEmail) {
      if (invoiceWithItems.client.email) {
        console.log(`📧 Sending invoice email to client: ${invoiceWithItems.client.name} (${invoiceWithItems.client.email})`);
        await this.emailService.sendInvoiceNotification(
          invoiceWithItems.client.email,
          invoiceWithItems.invoiceNumber,
          invoiceWithItems.amount,
          invoiceWithItems.dueDate || undefined
        );
      } else {
        console.warn(`⚠️  Email requested but client "${invoiceWithItems.client.name}" has no email address`);
      }
    }

    // Send SMS notification if requested and client has phone
    if (createInvoiceDto.sendText) {
      if (invoiceWithItems.client.phone) {
        console.log(`📱 Sending invoice SMS to client: ${invoiceWithItems.client.name} (${invoiceWithItems.client.phone})`);
        await this.smsService.sendInvoiceNotification(
          invoiceWithItems.client.phone,
          invoiceWithItems.invoiceNumber,
          invoiceWithItems.amount,
          invoiceWithItems.dueDate || undefined
        );
      } else {
        console.warn(`⚠️  SMS requested but client "${invoiceWithItems.client.name}" has no phone number`);
      }
    }

    return invoiceWithItems;
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { client: true, job: true, lineItems: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { client: true, job: true, lineItems: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(id: string, companyId: string, updateInvoiceDto: UpdateInvoiceDto) {
    await this.findOne(id, companyId);
    
    // If line items are being updated, recalculate amount
    const invoice = await this.findOne(id, companyId);
    let amount = updateInvoiceDto.amount;
    
    // If line items exist, calculate from them
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      const taxRate = updateInvoiceDto.taxRate ?? invoice.taxRate;
      amount = invoice.lineItems.reduce((total, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTax = itemTotal * (item.taxRate || taxRate);
        return total + itemTotal + itemTax;
      }, 0);
    }
    
    const updateData: any = { ...updateInvoiceDto };
    delete updateData.companyId; // Remove companyId as it's not updatable
    delete updateData.lineItems; // Line items are managed separately
    
    if (amount !== undefined) {
      updateData.amount = amount;
    }
    
    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { client: true, job: true, lineItems: true },
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
      include: { client: true, job: true, lineItems: true },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}

