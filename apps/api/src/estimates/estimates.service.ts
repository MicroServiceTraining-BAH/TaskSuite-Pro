import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEstimateDto } from "./dto/create-estimate.dto";
import { UpdateEstimateDto } from "./dto/update-estimate.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class EstimatesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(companyId: string, createEstimateDto: CreateEstimateDto) {
    const estimate = await this.prisma.estimate.create({
      data: {
        ...createEstimateDto,
        companyId,
      },
      include: { client: true },
    });

    // Send email notification if client has email and portal access
    if (estimate.client.email && estimate.client.hasPortalAccess) {
      await this.emailService.sendEstimateNotification(
        estimate.client.email,
        estimate.title,
        estimate.id
      );
    }

    return estimate;
  }

  async findAll(companyId: string) {
    return this.prisma.estimate.findMany({
      where: { companyId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const estimate = await this.prisma.estimate.findFirst({
      where: { id, companyId },
      include: { client: true },
    });
    if (!estimate) {
      throw new NotFoundException(`Estimate with ID ${id} not found`);
    }
    return estimate;
  }

  async update(id: string, companyId: string, updateEstimateDto: UpdateEstimateDto) {
    await this.findOne(id, companyId);
    return this.prisma.estimate.update({
      where: { id },
      data: updateEstimateDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.estimate.delete({
      where: { id },
    });
  }

  async convertToJob(estimateId: string, companyId: string) {
    const estimate = await this.findOne(estimateId, companyId);
    
    if (estimate.status === "converted") {
      throw new BadRequestException("Estimate has already been converted to a job");
    }

    // Create job from estimate
    const job = await this.prisma.job.create({
      data: {
        companyId,
        clientId: estimate.clientId,
        estimateId: estimate.id,
        title: estimate.title,
        description: estimate.description,
        status: "pending",
      },
    });

    // Update estimate status
    await this.prisma.estimate.update({
      where: { id: estimateId },
      data: { status: "converted" },
    });

    return job;
  }
}

