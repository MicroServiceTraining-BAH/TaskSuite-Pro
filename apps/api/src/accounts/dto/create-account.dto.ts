import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['income', 'expense', 'asset', 'liability', 'equity'])
  type: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

