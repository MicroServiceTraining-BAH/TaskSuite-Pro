import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(companyId: string, createJobDto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        ...createJobDto,
        companyId,
      },
      include: { client: true, estimate: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.job.findMany({
      where: { companyId },
      include: { client: true, estimate: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, companyId },
      include: { client: true, estimate: true },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(id: string, companyId: string, updateJobDto: UpdateJobDto) {
    const currentJob = await this.findOne(id, companyId);
    
    // Validate status transitions if status is being updated
    if (updateJobDto.status) {
      const validTransitions = this.getValidStatusTransitions(currentJob.status);
      if (!validTransitions.includes(updateJobDto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${currentJob.status} to ${updateJobDto.status}`
        );
      }
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: updateJobDto,
      include: { client: true, estimate: true },
    });

    // Send email notification if status changed and client has email/portal access
    if (updateJobDto.status && currentJob.status !== updateJobDto.status) {
      if (updatedJob.client.email && updatedJob.client.hasPortalAccess) {
        await this.emailService.sendJobUpdateNotification(
          updatedJob.client.email,
          updatedJob.title,
          updateJobDto.status
        );
      }
    }

    return updatedJob;
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.job.delete({
      where: { id },
    });
  }

  private getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      pending: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  }
}

