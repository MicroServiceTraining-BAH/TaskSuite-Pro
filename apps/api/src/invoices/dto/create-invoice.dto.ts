import { IsString, IsNumber, IsDate, IsOptional, MinLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

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

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: "2024-02-15", required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date | null;

  @ApiProperty({ example: "pending", default: "pending" })
  @IsString()
  status: string;

  companyId: string; // Injected by controller
}

