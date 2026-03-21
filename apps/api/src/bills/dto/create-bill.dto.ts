import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateBillDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsString()
  vendor: string;

  @IsOptional()
  @IsString()
  billNumber?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  @IsIn(['unpaid', 'paid', 'overdue'])
  status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

