import { IsString, IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFlooringMaterialDto {
  @ApiProperty({ example: "hardwood" })
  @IsString()
  materialType: string;

  @ApiProperty({ example: "Oak Hardwood" })
  @IsString()
  name: string;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: "sqft" })
  @IsString()
  unit: string;

  @ApiProperty({ example: 8.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 10.0, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  wastePercent?: number;

  @ApiProperty({ example: "Notes", required: false })
  @IsOptional()
  @IsString()
  notes?: string | null;

  companyId: string; // Injected by controller
}

