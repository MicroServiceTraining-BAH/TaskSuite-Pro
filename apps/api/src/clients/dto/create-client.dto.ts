import { IsString, IsEmail, IsOptional, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateClientDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty({ message: 'Client name is required' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: "john@example.com", required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string | null;

  @ApiProperty({ example: "+1234567890", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @ApiProperty({ example: "123 Main St", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;
}

