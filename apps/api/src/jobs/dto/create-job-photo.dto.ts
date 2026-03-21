import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateJobPhotoDto {
  @ApiProperty({ example: "https://example.com/photo.jpg" })
  @IsString()
  url: string;

  @ApiProperty({ example: "before", required: false })
  @IsOptional()
  @IsString()
  photoType?: string;

  @ApiProperty({ example: "Photo description", required: false })
  @IsOptional()
  @IsString()
  description?: string | null;
}

