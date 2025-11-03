import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateClientDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: "john@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiProperty({ example: "+1234567890", required: false })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ example: "123 Main St", required: false })
  @IsOptional()
  @IsString()
  address?: string | null;

  companyId: string; // Injected by controller
}

