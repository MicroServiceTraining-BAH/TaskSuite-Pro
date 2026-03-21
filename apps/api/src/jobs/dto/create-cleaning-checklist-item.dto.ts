import { IsString, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCleaningChecklistItemDto {
  @ApiProperty({ example: "bedroom" })
  @IsString()
  room: string;

  @ApiProperty({ example: "vacuum" })
  @IsString()
  task: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ example: "Notes", required: false })
  @IsOptional()
  @IsString()
  notes?: string | null;

  companyId: string; // Injected by controller
}

