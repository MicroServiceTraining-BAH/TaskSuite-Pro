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
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

@ApiTags("clients")
@Controller("clients")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: "Create a client" })
  @ApiResponse({ status: 201, description: "Client created successfully" })
  create(@Body() createClientDto: CreateClientDto, @User() user: any) {
    return this.clientsService.create(user.companyId, createClientDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all clients" })
  @ApiResponse({ status: 200, description: "List of clients" })
  findAll(@User() user: any) {
    return this.clientsService.findAll(user.companyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a client by ID" })
  @ApiResponse({ status: 200, description: "Client details" })
  @ApiResponse({ status: 404, description: "Client not found" })
  findOne(@Param("id") id: string, @User() user: any) {
    return this.clientsService.findOne(id, user.companyId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a client" })
  @ApiResponse({ status: 200, description: "Client updated successfully" })
  update(
    @Param("id") id: string,
    @Body() updateClientDto: UpdateClientDto,
    @User() user: any
  ) {
    return this.clientsService.update(id, user.companyId, updateClientDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a client" })
  @ApiResponse({ status: 200, description: "Client deleted successfully" })
  remove(@Param("id") id: string, @User() user: any) {
    return this.clientsService.remove(id, user.companyId);
  }
}

