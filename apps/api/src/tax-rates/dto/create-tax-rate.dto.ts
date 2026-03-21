import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateTaxRateDto {
  @IsString()
  name: string; // e.g., "Sales Tax", "GST", "VAT"

  @IsNumber()
  @Min(0)
  @Max(1)
  rate: number; // e.g., 0.08 for 8%

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

