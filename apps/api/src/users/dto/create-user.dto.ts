import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "user", default: "user" })
  @IsString()
  @MinLength(1)
  role: string;

  // companyId is injected by controller from JWT, not part of DTO
}

