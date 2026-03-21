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
import { EstimatesService } from "./estimates.service";
import { CreateEstimateDto } from "./dto/create-estimate.dto";
import { UpdateEstimateDto } from "./dto/update-estimate.dto";
import { ConvertEstimateDto } from "./dto/convert-estimate.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

@ApiTags("estimates")
@Controller("estimates")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  @ApiOperation({ summary: "Create an estimate" })
  @ApiResponse({ status: 201, description: "Estimate created successfully" })
  create(@Body() createEstimateDto: CreateEstimateDto, @User() user: any) {
    return this.estimatesService.create(user.companyId, createEstimateDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all estimates" })
  @ApiResponse({ status: 200, description: "List of estimates" })
  findAll(@User() user: any) {
    return this.estimatesService.findAll(user.companyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an estimate by ID" })
  @ApiResponse({ status: 200, description: "Estimate details" })
  @ApiResponse({ status: 404, description: "Estimate not found" })
  findOne(@Param("id") id: string, @User() user: any) {
    return this.estimatesService.findOne(id, user.companyId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an estimate" })
  @ApiResponse({ status: 200, description: "Estimate updated successfully" })
  update(
    @Param("id") id: string,
    @Body() updateEstimateDto: UpdateEstimateDto,
    @User() user: any
  ) {
    return this.estimatesService.update(id, user.companyId, updateEstimateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an estimate" })
  @ApiResponse({ status: 200, description: "Estimate deleted successfully" })
  remove(@Param("id") id: string, @User() user: any) {
    return this.estimatesService.remove(id, user.companyId);
  }

  @Post(":id/convert-to-job")
  @ApiOperation({ summary: "Convert an estimate to a job" })
  @ApiResponse({ status: 200, description: "Estimate converted to job successfully" })
  convertToJob(@Param("id") id: string, @User() user: any) {
    return this.estimatesService.convertToJob(id, user.companyId);
  }
}

// Public controller for viewing/approving estimates without authentication
@ApiTags("estimates")
@Controller("public/estimates")
export class PublicEstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Get(":token")
  @ApiOperation({ summary: "Get an estimate by public token (no auth required)" })
  @ApiResponse({ status: 200, description: "Estimate details" })
  @ApiResponse({ status: 404, description: "Estimate not found" })
  findByToken(@Param("token") token: string) {
    return this.estimatesService.findByPublicToken(token);
  }

  @Post(":token/approve")
  @ApiOperation({ summary: "Approve an estimate by public token (no auth required)" })
  @ApiResponse({ status: 200, description: "Estimate approved successfully" })
  approve(@Param("token") token: string) {
    return this.estimatesService.approveByToken(token);
  }

  @Post(":token/reject")
  @ApiOperation({ summary: "Reject an estimate by public token (no auth required)" })
  @ApiResponse({ status: 200, description: "Estimate rejected successfully" })
  reject(@Param("token") token: string) {
    return this.estimatesService.rejectByToken(token);
  }
}

