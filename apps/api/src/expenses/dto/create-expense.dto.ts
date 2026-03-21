import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateExpenseDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @IsIn(['cash', 'check', 'credit_card', 'bank_transfer'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

