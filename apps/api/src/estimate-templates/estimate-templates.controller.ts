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
import { EstimateTemplatesService } from "./estimate-templates.service";
import { CreateEstimateTemplateDto } from "./dto/create-estimate-template.dto";
import { UpdateEstimateTemplateDto } from "./dto/update-estimate-template.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

@ApiTags("estimate-templates")
@Controller("estimate-templates")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EstimateTemplatesController {
  constructor(private readonly templatesService: EstimateTemplatesService) {}

  @Post()
  @ApiOperation({ summary: "Create an estimate template" })
  @ApiResponse({ status: 201, description: "Template created successfully" })
  create(@Body() createTemplateDto: CreateEstimateTemplateDto, @User() user: any) {
    return this.templatesService.create(user.companyId, createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all estimate templates" })
  @ApiResponse({ status: 200, description: "List of templates" })
  findAll(@User() user: any) {
    return this.templatesService.findAll(user.companyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an estimate template by ID" })
  @ApiResponse({ status: 200, description: "Template details" })
  @ApiResponse({ status: 404, description: "Template not found" })
  findOne(@Param("id") id: string, @User() user: any) {
    return this.templatesService.findOne(id, user.companyId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an estimate template" })
  @ApiResponse({ status: 200, description: "Template updated successfully" })
  update(
    @Param("id") id: string,
    @Body() updateTemplateDto: UpdateEstimateTemplateDto,
    @User() user: any
  ) {
    return this.templatesService.update(id, user.companyId, updateTemplateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an estimate template" })
  @ApiResponse({ status: 200, description: "Template deleted successfully" })
  remove(@Param("id") id: string, @User() user: any) {
    return this.templatesService.remove(id, user.companyId);
  }
}

