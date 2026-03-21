import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateEstimateLineItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number; // Sales tax rate (e.g., 0.08 for 8%)
}

