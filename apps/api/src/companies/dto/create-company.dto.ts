import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyDto {
  @ApiProperty({ example: "CleaningCo" })
  @IsString()
  @MinLength(1)
  name: string;
}

