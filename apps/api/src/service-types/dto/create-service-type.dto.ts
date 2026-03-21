import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateServiceTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  pricingItems?: Array<{ id: string; name: string; price: number }>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
