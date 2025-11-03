import { IsString, IsOptional, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateJobDto {
  @ApiProperty({ example: "client-id" })
  @IsString()
  clientId: string;

  @ApiProperty({ example: "estimate-id", required: false })
  @IsOptional()
  @IsString()
  estimateId?: string | null;

  @ApiProperty({ example: "Kitchen Cleaning" })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: "Full kitchen deep clean", required: false })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: "pending", default: "pending" })
  @IsString()
  status: string;

  companyId: string; // Injected by controller
}

