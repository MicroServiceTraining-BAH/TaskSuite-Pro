import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

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

