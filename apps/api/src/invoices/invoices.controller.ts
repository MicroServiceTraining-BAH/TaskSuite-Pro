import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

@ApiTags("invoices")
@Controller("invoices")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: "Create an invoice" })
  @ApiResponse({ status: 201, description: "Invoice created successfully" })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @User() user: any) {
    return this.invoicesService.create(user.companyId, createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all invoices" })
  @ApiResponse({ status: 200, description: "List of invoices" })
  findAll(@User() user: any) {
    return this.invoicesService.findAll(user.companyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an invoice by ID" })
  @ApiResponse({ status: 200, description: "Invoice details" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  findOne(@Param("id") id: string, @User() user: any) {
    return this.invoicesService.findOne(id, user.companyId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an invoice" })
  @ApiResponse({ status: 200, description: "Invoice updated successfully" })
  update(
    @Param("id") id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @User() user: any
  ) {
    return this.invoicesService.update(id, user.companyId, updateInvoiceDto);
  }

  @Post(":id/mark-paid")
  @ApiOperation({ summary: "Mark an invoice as paid" })
  @ApiResponse({ status: 200, description: "Invoice marked as paid" })
  markPaid(@Param("id") id: string, @User() user: any) {
    return this.invoicesService.markPaid(id, user.companyId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an invoice" })
  @ApiResponse({ status: 200, description: "Invoice deleted successfully" })
  remove(@Param("id") id: string, @User() user: any) {
    return this.invoicesService.remove(id, user.companyId);
  }
}

