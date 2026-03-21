import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { CreateInvoiceLineItemDto } from './dto/create-invoice-line-item.dto';
import { UpdateInvoiceLineItemDto } from './dto/update-invoice-line-item.dto';
import { NotFoundException } from '@nestjs/common';

@Controller('invoices/:invoiceId/line-items')
@UseGuards(JwtAuthGuard)
export class InvoiceLineItemsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(
    @User() user: any,
    @Param('invoiceId') invoiceId: string,
    @Body() createDto: CreateInvoiceLineItemDto,
  ) {
    // Verify invoice exists and belongs to company
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId: user.companyId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    const lineItem = await this.prisma.invoiceLineItem.create({
      data: {
        ...createDto,
        invoiceId,
        companyId: user.companyId,
        taxRate: createDto.taxRate ?? invoice.taxRate ?? 0,
      },
    });

    // Recalculate invoice total
    await this.recalculateInvoiceTotal(invoiceId, user.companyId);

    return lineItem;
  }

  @Get()
  async findAll(@User() user: any, @Param('invoiceId') invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId: user.companyId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    return this.prisma.invoiceLineItem.findMany({
      where: { invoiceId, companyId: user.companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Patch(':id')
  async update(
    @User() user: any,
    @Param('invoiceId') invoiceId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateInvoiceLineItemDto,
  ) {
    const lineItem = await this.prisma.invoiceLineItem.findFirst({
      where: { id, invoiceId, companyId: user.companyId },
    });
    if (!lineItem) {
      throw new NotFoundException(`Line item with ID ${id} not found`);
    }

    const updated = await this.prisma.invoiceLineItem.update({
      where: { id },
      data: updateDto,
    });

    // Recalculate invoice total
    await this.recalculateInvoiceTotal(invoiceId, user.companyId);

    return updated;
  }

  @Delete(':id')
  async remove(
    @User() user: any,
    @Param('invoiceId') invoiceId: string,
    @Param('id') id: string,
  ) {
    const lineItem = await this.prisma.invoiceLineItem.findFirst({
      where: { id, invoiceId, companyId: user.companyId },
    });
    if (!lineItem) {
      throw new NotFoundException(`Line item with ID ${id} not found`);
    }

    await this.prisma.invoiceLineItem.delete({ where: { id } });

    // Recalculate invoice total
    await this.recalculateInvoiceTotal(invoiceId, user.companyId);

    return { message: 'Line item deleted successfully' };
  }

  private async recalculateInvoiceTotal(invoiceId: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: { lineItems: true },
    });

    if (!invoice) return;

    const total = invoice.lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const tax = itemTotal * (item.taxRate || invoice.taxRate || 0);
      return sum + itemTotal + tax;
    }, 0);

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { amount: total },
    });
  }
}

