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
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@ApiTags("companies")
@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: "Create a company" })
  @ApiResponse({ status: 201, description: "Company created successfully" })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all companies" })
  @ApiResponse({ status: 200, description: "List of companies" })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a company by ID" })
  @ApiResponse({ status: 200, description: "Company details" })
  @ApiResponse({ status: 404, description: "Company not found" })
  findOne(@Param("id") id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a company" })
  @ApiResponse({ status: 200, description: "Company updated successfully" })
  @ApiResponse({ status: 404, description: "Company not found" })
  update(@Param("id") id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a company" })
  @ApiResponse({ status: 200, description: "Company deleted successfully" })
  @ApiResponse({ status: 404, description: "Company not found" })
  remove(@Param("id") id: string) {
    return this.companiesService.remove(id);
  }
}

