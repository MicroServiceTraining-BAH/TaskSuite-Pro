import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { CreateJobPhotoDto } from "./dto/create-job-photo.dto";
import { CreateCleaningChecklistItemDto } from "./dto/create-cleaning-checklist-item.dto";
import { CreateFlooringMaterialDto } from "./dto/create-flooring-material.dto";
import { EmailService } from "../email/email.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(companyId: string, createJobDto: CreateJobDto) {
    const { isRecurring = false, recurrenceRule, weeksToRepeat = 4, ...jobData } = createJobDto;

    if (isRecurring && recurrenceRule) {
      // Create multiple jobs for recurring schedule
      const jobs: Array<{
        id: string;
        companyId: string;
        clientId: string;
        estimateId: string | null;
        title: string;
        description: string | null;
        status: string;
        jobType: string | null;
        isRecurring: boolean;
        recurrenceRule: string | null;
        parentJobId: string | null;
        createdAt: Date;
        updatedAt: Date;
        client: any;
        estimate: any;
      }> = [];
      const now = new Date();
      
      // Parse recurrence rule (simple weekly for now)
      const match = recurrenceRule.match(/FREQ=WEEKLY;COUNT=(\d+)/);
      const count = match ? parseInt(match[1]) : weeksToRepeat || 4;

      for (let week = 0; week < count; week++) {
        const weekOffset = week * 7 * 24 * 60 * 60 * 1000;
        const scheduledDate = new Date(now.getTime() + weekOffset);
        
        const job: any = await this.prisma.job.create({
          data: {
            ...jobData,
            companyId,
            isRecurring: week === 0, // Only first job is marked as recurring
            recurrenceRule: week === 0 ? recurrenceRule : null,
            parentJobId: week === 0 ? null : jobs[0]?.id || null,
          },
          include: { client: true, estimate: true },
        });
        
        if (week === 0) {
          jobs.push(job);
        } else {
          // Update parentJobId for subsequent jobs
          const updatedJob: any = await this.prisma.job.update({
            where: { id: job.id },
            data: { parentJobId: jobs[0].id },
            include: { client: true, estimate: true },
          });
          jobs.push(updatedJob);
        }
      }
      
      return jobs;
    } else {
      // Single job
      return this.prisma.job.create({
        data: {
          ...jobData,
          companyId,
          isRecurring: false,
        },
        include: { client: true, estimate: true },
      });
    }
  }

  async findAll(companyId: string) {
    return this.prisma.job.findMany({
      where: { companyId },
      include: {
        client: true,
        estimate: true,
        photos: true,
        cleaningChecklist: true,
        flooringMaterials: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        estimate: true,
        photos: true,
        cleaningChecklist: true,
        flooringMaterials: true,
      },
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
      include: {
        client: true,
        estimate: true,
        photos: true,
        cleaningChecklist: true,
        flooringMaterials: true,
      },
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

  // Job Photos
  async addPhoto(jobId: string, companyId: string, createPhotoDto: CreateJobPhotoDto) {
    await this.findOne(jobId, companyId); // Verify job exists and belongs to company
    
    return this.prisma.jobPhoto.create({
      data: {
        jobId,
        companyId,
        url: createPhotoDto.url,
        photoType: createPhotoDto.photoType || "general",
        description: createPhotoDto.description,
      },
    });
  }

  async getPhotos(jobId: string, companyId: string) {
    await this.findOne(jobId, companyId); // Verify job exists
    
    return this.prisma.jobPhoto.findMany({
      where: { jobId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removePhoto(jobId: string, photoId: string, companyId: string) {
    await this.findOne(jobId, companyId); // Verify job exists
    
    const photo = await this.prisma.jobPhoto.findFirst({
      where: { id: photoId, jobId, companyId },
    });
    
    if (!photo) {
      throw new NotFoundException("Photo not found");
    }
    
    // Delete the file from filesystem
    const filePath = path.join(process.cwd(), 'uploads', path.basename(photo.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return this.prisma.jobPhoto.delete({
      where: { id: photoId },
    });
  }

  // Cleaning Checklist
  async upsertChecklistItem(jobId: string, companyId: string, createItemDto: CreateCleaningChecklistItemDto) {
    await this.findOne(jobId, companyId); // Verify job exists
    
    // Check if item already exists
    const existing = await this.prisma.cleaningChecklistItem.findFirst({
      where: {
        jobId,
        companyId,
        room: createItemDto.room,
        task: createItemDto.task,
      },
    });
    
    if (existing) {
      return this.prisma.cleaningChecklistItem.update({
        where: { id: existing.id },
        data: {
          completed: createItemDto.completed ?? existing.completed,
          notes: createItemDto.notes ?? existing.notes,
          completedAt: createItemDto.completed ? new Date() : existing.completedAt,
        },
      });
    }
    
    return this.prisma.cleaningChecklistItem.create({
      data: {
        jobId,
        companyId,
        room: createItemDto.room,
        task: createItemDto.task,
        completed: createItemDto.completed || false,
        notes: createItemDto.notes,
        completedAt: createItemDto.completed ? new Date() : null,
      },
    });
  }

  async removeChecklistItem(jobId: string, itemId: string, companyId: string) {
    await this.findOne(jobId, companyId); // Verify job exists
    
    const item = await this.prisma.cleaningChecklistItem.findFirst({
      where: { id: itemId, jobId, companyId },
    });
    
    if (!item) {
      throw new NotFoundException("Checklist item not found");
    }
    
    return this.prisma.cleaningChecklistItem.delete({
      where: { id: itemId },
    });
  }

  // Flooring Materials
  async addFlooringMaterial(jobId: string, companyId: string, createMaterialDto: CreateFlooringMaterialDto) {
    await this.findOne(jobId, companyId); // Verify job exists
    
    const quantity = createMaterialDto.quantity;
    const unitPrice = createMaterialDto.unitPrice;
    const wastePercent = createMaterialDto.wastePercent || 0;
    const totalCost = quantity * unitPrice * (1 + wastePercent / 100);
    
    return this.prisma.flooringMaterial.create({
      data: {
        jobId,
        companyId,
        materialType: createMaterialDto.materialType,
        name: createMaterialDto.name,
        quantity,
        unit: createMaterialDto.unit,
        unitPrice,
        wastePercent,
        totalCost,
        notes: createMaterialDto.notes,
      },
    });
  }

  async updateFlooringMaterial(
    jobId: string,
    materialId: string,
    companyId: string,
    updateMaterialDto: Partial<CreateFlooringMaterialDto>
  ) {
    await this.findOne(jobId, companyId); // Verify job exists
    
    const material = await this.prisma.flooringMaterial.findFirst({
      where: { id: materialId, jobId, companyId },
    });
    
    if (!material) {
      throw new NotFoundException("Material not found");
    }
    
    const quantity = updateMaterialDto.quantity ?? material.quantity;
    const unitPrice = updateMaterialDto.unitPrice ?? material.unitPrice;
    const wastePercent = updateMaterialDto.wastePercent ?? material.wastePercent;
    const totalCost = quantity * unitPrice * (1 + wastePercent / 100);
    
    return this.prisma.flooringMaterial.update({
      where: { id: materialId },
      data: {
        ...updateMaterialDto,
        totalCost,
      },
    });
  }

  async removeFlooringMaterial(jobId: string, materialId: string, companyId: string) {
    await this.findOne(jobId, companyId); // Verify job exists
    
    const material = await this.prisma.flooringMaterial.findFirst({
      where: { id: materialId, jobId, companyId },
    });
    
    if (!material) {
      throw new NotFoundException("Material not found");
    }
    
    return this.prisma.flooringMaterial.delete({
      where: { id: materialId },
    });
  }
}

