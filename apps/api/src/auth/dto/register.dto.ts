import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "John Doe" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "company-id" })
  @IsString()
  companyId: string;

  @ApiProperty({ example: "user", default: "user" })
  @IsOptional()
  @IsString()
  role?: string;
}

