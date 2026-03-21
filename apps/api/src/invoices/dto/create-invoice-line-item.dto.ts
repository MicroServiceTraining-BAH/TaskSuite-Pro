import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateInvoiceLineItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNumber()
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: 'Unit price must be 0 or greater' })
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number; // Sales tax rate (e.g., 0.08 for 8%)
}
