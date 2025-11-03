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
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";

@ApiTags("appointments")
@Controller("appointments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: "Create an appointment (or multiple for weekly recurrence)" })
  @ApiResponse({ status: 201, description: "Appointment(s) created successfully" })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @User() user: any) {
    return this.appointmentsService.create(user.companyId, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all appointments" })
  @ApiResponse({ status: 200, description: "List of appointments" })
  findAll(@User() user: any) {
    return this.appointmentsService.findAll(user.companyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an appointment by ID" })
  @ApiResponse({ status: 200, description: "Appointment details" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  findOne(@Param("id") id: string, @User() user: any) {
    return this.appointmentsService.findOne(id, user.companyId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an appointment" })
  @ApiResponse({ status: 200, description: "Appointment updated successfully" })
  update(
    @Param("id") id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @User() user: any
  ) {
    return this.appointmentsService.update(id, user.companyId, updateAppointmentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an appointment" })
  @ApiResponse({ status: 200, description: "Appointment deleted successfully" })
  remove(@Param("id") id: string, @User() user: any) {
    return this.appointmentsService.remove(id, user.companyId);
  }
}

