import {
  Controller,
  Get,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("clients-portal")
@Controller("client")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsPortalController {
  constructor(private prisma: PrismaService) {}

  @Get("estimates")
  @ApiOperation({ summary: "Get client's estimates" })
  @ApiResponse({ status: 200, description: "List of client's estimates" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getEstimates(@User() user: any) {
    if (user?.type !== "client" || !user?.clientId) {
      throw new UnauthorizedException("Client access required");
    }
    return this.prisma.estimate.findMany({
      where: { clientId: user.clientId },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("jobs")
  @ApiOperation({ summary: "Get client's jobs" })
  @ApiResponse({ status: 200, description: "List of client's jobs" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getJobs(@User() user: any) {
    if (user?.type !== "client" || !user?.clientId) {
      throw new UnauthorizedException("Client access required");
    }
    return this.prisma.job.findMany({
      where: { clientId: user.clientId },
      include: { company: true, estimate: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("invoices")
  @ApiOperation({ summary: "Get client's invoices" })
  @ApiResponse({ status: 200, description: "List of client's invoices" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getInvoices(@User() user: any) {
    if (user?.type !== "client" || !user?.clientId) {
      throw new UnauthorizedException("Client access required");
    }
    return this.prisma.invoice.findMany({
      where: { clientId: user.clientId },
      include: { company: true, job: true },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("appointments")
  @ApiOperation({ summary: "Get client's appointments" })
  @ApiResponse({ status: 200, description: "List of client's appointments" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAppointments(@User() user: any) {
    if (user?.type !== "client" || !user?.clientId) {
      throw new UnauthorizedException("Client access required");
    }
    return this.prisma.appointment.findMany({
      where: { clientId: user.clientId },
      include: { company: true, job: true },
      orderBy: { startTime: "asc" },
    });
  }
}

