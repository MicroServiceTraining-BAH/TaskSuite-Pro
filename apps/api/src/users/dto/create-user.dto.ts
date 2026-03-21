import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail({ message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: "user", default: "user" })
  @IsString()
  @IsIn(['owner', 'admin', 'user'], { message: 'Invalid role' })
  role: string;

  // companyId is injected by controller from JWT, not part of DTO
}

