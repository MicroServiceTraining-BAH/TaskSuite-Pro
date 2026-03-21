import { IsString, IsNumber, IsOptional, MinLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateInvoiceTemplateDto {
  @ApiProperty({ example: "Standard Service Invoice" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: "INV-", required: false })
  @IsOptional()
  @IsString()
  invoiceNumber?: string | null;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  dueDateDays?: number | null;

  companyId: string; // Injected by controller
}

