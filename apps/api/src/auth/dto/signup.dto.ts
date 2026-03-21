import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
  @ApiProperty({ example: "owner@example.com" })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: "John Doe" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ example: "Acme Services" })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  companyName: string;
}

