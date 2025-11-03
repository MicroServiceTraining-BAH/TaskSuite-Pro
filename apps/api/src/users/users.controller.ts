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
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a user" })
  create(@Body() createUserDto: CreateUserDto, @User() user: any) {
    // companyId is extracted from JWT token and added here
    return this.usersService.create(createUserDto, user.companyId);
  }

  @Get()
  @ApiOperation({ summary: "Get all users for the company" })
  findAll(@User() user: any) {
    return this.usersService.findAll(user.companyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by ID" })
  findOne(@Param("id") id: string, @User() user: any) {
    return this.usersService.findOne(id, user.companyId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user" })
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: any
  ) {
    return this.usersService.update(id, user.companyId, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  remove(@Param("id") id: string, @User() user: any) {
    return this.usersService.remove(id, user.companyId);
  }
}

