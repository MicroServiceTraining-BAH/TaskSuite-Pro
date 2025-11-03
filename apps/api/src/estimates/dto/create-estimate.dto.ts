import { IsString, IsNumber, IsOptional, MinLength, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEstimateDto {
  @ApiProperty({ example: "client-id" })
  @IsString()
  clientId: string;

  @ApiProperty({ example: "Kitchen Cleaning Estimate" })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: "Full kitchen deep clean", required: false })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: "draft", default: "draft" })
  @IsString()
  status: string;

  companyId: string; // Injected by controller
}

