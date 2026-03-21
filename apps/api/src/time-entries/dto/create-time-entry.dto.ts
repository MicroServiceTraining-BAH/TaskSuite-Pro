import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateTimeEntryDto {
  @IsString()
  jobId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  hours: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;
}

