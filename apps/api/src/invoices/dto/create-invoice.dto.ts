import { IsString, IsNumber, IsDate, IsOptional, MinLength, Min, ValidateNested, IsArray, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CreateInvoiceLineItemDto } from "./create-invoice-line-item.dto";

export class CreateInvoiceDto {
  @ApiProperty({ example: "client-id" })
  @IsString()
  clientId: string;

  @ApiProperty({ example: "job-id", required: false })
  @IsOptional()
  @IsString()
  jobId?: string | null;

  @ApiProperty({ example: "INV-2024-001" })
  @IsString()
  @MinLength(1)
  invoiceNumber: string;

  @ApiProperty({ example: 250.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number; // Calculated from line items if provided

  @ApiProperty({ example: 0.08, required: false, description: "Overall tax rate if not using per-item rates" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiProperty({ example: "2024-02-15", required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date | null;

  @ApiProperty({ example: "pending", default: "pending" })
  @IsString()
  status: string;

  @ApiProperty({ type: [CreateInvoiceLineItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems?: CreateInvoiceLineItemDto[];

  @ApiProperty({ example: false, required: false, description: "Send email notification to client" })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiProperty({ example: false, required: false, description: "Send text message notification to client" })
  @IsOptional()
  @IsBoolean()
  sendText?: boolean;
}

