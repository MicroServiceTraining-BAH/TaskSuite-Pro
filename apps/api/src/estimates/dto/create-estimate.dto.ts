import { IsString, IsNumber, IsOptional, MinLength, Min, ValidateNested, IsArray, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CreateEstimateLineItemDto } from "./create-estimate-line-item.dto";

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

  @ApiProperty({ example: 250.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number; // Calculated from line items if provided

  @ApiProperty({ example: 0.08, required: false, description: "Overall tax rate if not using per-item rates" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiProperty({ example: "draft", default: "draft" })
  @IsString()
  status: string;

  @ApiProperty({ example: "cleaning", required: false })
  @IsOptional()
  @IsString()
  estimateType?: string | null;

  @ApiProperty({ required: false, description: "Builder-specific metadata (rooms, addons, materials, etc.)" })
  @IsOptional()
  metadata?: any;

  @ApiProperty({ type: [CreateEstimateLineItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEstimateLineItemDto)
  lineItems?: CreateEstimateLineItemDto[];

  @ApiProperty({ example: false, required: false, description: "Send email notification to client" })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiProperty({ example: false, required: false, description: "Send text message notification to client" })
  @IsOptional()
  @IsBoolean()
  sendText?: boolean;
}

