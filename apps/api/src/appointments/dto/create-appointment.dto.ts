import { IsString, IsDate, IsOptional, IsBoolean, IsNumber, MinLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateAppointmentDto {
  @ApiProperty({ example: "job-id", required: false })
  @IsOptional()
  @IsString()
  jobId?: string | null;

  @ApiProperty({ example: "client-id", required: false })
  @IsOptional()
  @IsString()
  clientId?: string | null;

  @ApiProperty({ example: "Kitchen Cleaning Appointment" })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: "Full kitchen deep clean", required: false })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: "2024-01-15T10:00:00Z" })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  repeatWeekly?: boolean;

  @ApiProperty({ example: 4, default: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  weeksToRepeat?: number;

  companyId: string; // Injected by controller
}

