import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { CreateJobPhotoDto } from "./dto/create-job-photo.dto";
import { CreateCleaningChecklistItemDto } from "./dto/create-cleaning-checklist-item.dto";
import { CreateFlooringMaterialDto } from "./dto/create-flooring-material.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";
import { multerConfig } from "./upload.config";

@ApiTags("jobs")
@Controller("jobs")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: "Create a job" })
  @ApiResponse({ status: 201, description: "Job created successfully" })
  create(@Body() createJobDto: CreateJobDto, @User() user: any) {
    return this.jobsService.create(user.companyId, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all jobs" })
  @ApiResponse({ status: 200, description: "List of jobs" })
  findAll(@User() user: any) {
    return this.jobsService.findAll(user.companyId);
  }

  // Job Photos - Must be before :id route to avoid route conflicts
  @Get(":id/photos")
  @ApiOperation({ summary: "Get all photos for a job" })
  @ApiResponse({ status: 200, description: "List of job photos" })
  getPhotos(@Param("id") jobId: string, @User() user: any) {
    return this.jobsService.getPhotos(jobId, user.companyId);
  }

  @Post(":id/photos")
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Upload a photo to a job" })
  @ApiResponse({ status: 201, description: "Photo uploaded successfully" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        photoType: {
          type: 'string',
          example: 'before',
        },
        description: {
          type: 'string',
          example: 'Photo description',
        },
      },
    },
  })
  async uploadPhoto(
    @Param("id") jobId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      })
    ) file: Express.Multer.File,
    @Body() body: { photoType?: string; description?: string },
    @User() user: any
  ) {
    const photoUrl = `/uploads/${file.filename}`;
    const createPhotoDto: CreateJobPhotoDto = {
      url: photoUrl,
      photoType: body.photoType || 'general',
      description: body.description || null,
    };
    return this.jobsService.addPhoto(jobId, user.companyId, createPhotoDto);
  }

  @Delete(":id/photos/:photoId")
  @ApiOperation({ summary: "Delete a job photo" })
  @ApiResponse({ status: 200, description: "Photo deleted successfully" })
  removePhoto(@Param("id") jobId: string, @Param("photoId") photoId: string, @User() user: any) {
    return this.jobsService.removePhoto(jobId, photoId, user.companyId);
  }

  // Cleaning Checklist - Must be before :id route to avoid route conflicts
  @Post(":id/cleaning-checklist")
  @ApiOperation({ summary: "Add or update a cleaning checklist item" })
  @ApiResponse({ status: 201, description: "Checklist item added/updated successfully" })
  upsertChecklistItem(
    @Param("id") jobId: string,
    @Body() createItemDto: CreateCleaningChecklistItemDto,
    @User() user: any
  ) {
    return this.jobsService.upsertChecklistItem(jobId, user.companyId, createItemDto);
  }

  @Delete(":id/cleaning-checklist/:itemId")
  @ApiOperation({ summary: "Delete a cleaning checklist item" })
  @ApiResponse({ status: 200, description: "Checklist item deleted successfully" })
  removeChecklistItem(
    @Param("id") jobId: string,
    @Param("itemId") itemId: string,
    @User() user: any
  ) {
    return this.jobsService.removeChecklistItem(jobId, itemId, user.companyId);
  }

  // Flooring Materials - Must be before :id route to avoid route conflicts
  @Post(":id/flooring-materials")
  @ApiOperation({ summary: "Add a flooring material to a job" })
  @ApiResponse({ status: 201, description: "Material added successfully" })
  addFlooringMaterial(
    @Param("id") jobId: string,
    @Body() createMaterialDto: CreateFlooringMaterialDto,
    @User() user: any
  ) {
    return this.jobsService.addFlooringMaterial(jobId, user.companyId, createMaterialDto);
  }

  @Patch(":id/flooring-materials/:materialId")
  @ApiOperation({ summary: "Update a flooring material" })
  @ApiResponse({ status: 200, description: "Material updated successfully" })
  updateFlooringMaterial(
    @Param("id") jobId: string,
    @Param("materialId") materialId: string,
    @Body() updateMaterialDto: Partial<CreateFlooringMaterialDto>,
    @User() user: any
  ) {
    return this.jobsService.updateFlooringMaterial(jobId, materialId, user.companyId, updateMaterialDto);
  }

  @Delete(":id/flooring-materials/:materialId")
  @ApiOperation({ summary: "Delete a flooring material" })
  @ApiResponse({ status: 200, description: "Material deleted successfully" })
  removeFlooringMaterial(
    @Param("id") jobId: string,
    @Param("materialId") materialId: string,
    @User() user: any
  ) {
    return this.jobsService.removeFlooringMaterial(jobId, materialId, user.companyId);
  }

  // General job routes - Must be after specific routes to avoid conflicts
  @Get(":id")
  @ApiOperation({ summary: "Get a job by ID" })
  @ApiResponse({ status: 200, description: "Job details" })
  @ApiResponse({ status: 404, description: "Job not found" })
  findOne(@Param("id") id: string, @User() user: any) {
    return this.jobsService.findOne(id, user.companyId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a job" })
  @ApiResponse({ status: 200, description: "Job updated successfully" })
  update(
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: any
  ) {
    return this.jobsService.update(id, user.companyId, updateJobDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a job" })
  @ApiResponse({ status: 200, description: "Job deleted successfully" })
  remove(@Param("id") id: string, @User() user: any) {
    return this.jobsService.remove(id, user.companyId);
  }
}

