import { IsString, IsOptional, IsNotEmpty, MaxLength, IsIn, IsBoolean, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateJobDto {
  @ApiProperty({ example: "client-id" })
  @IsString()
  @IsNotEmpty({ message: 'Client is required' })
  clientId: string;

  @ApiProperty({ example: "estimate-id", required: false })
  @IsOptional()
  @IsString()
  estimateId?: string | null;

  @ApiProperty({ example: "Kitchen Cleaning" })
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: "Full kitchen deep clean", required: false })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: "pending", default: "pending" })
  @IsString()
  @IsIn(['scheduled', 'in_progress', 'completed', 'cancelled'], { message: 'Invalid status' })
  status: string;

  @ApiProperty({ example: "cleaning", required: false })
  @IsOptional()
  @IsString()
  jobType?: string | null;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ example: "FREQ=WEEKLY;COUNT=4", required: false })
  @IsOptional()
  @IsString()
  recurrenceRule?: string | null;

  @ApiProperty({ example: "parent-job-id", required: false })
  @IsOptional()
  @IsString()
  parentJobId?: string | null;

  @ApiProperty({ example: 4, default: 4, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  weeksToRepeat?: number;

  companyId: string; // Injected by controller
}

