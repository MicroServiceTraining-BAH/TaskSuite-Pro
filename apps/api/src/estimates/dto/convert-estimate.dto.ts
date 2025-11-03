import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConvertEstimateDto {
  @ApiProperty({ example: "estimate-id" })
  @IsString()
  estimateId: string;
}

