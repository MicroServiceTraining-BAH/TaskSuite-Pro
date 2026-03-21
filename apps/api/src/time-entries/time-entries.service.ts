import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createTimeEntryDto: CreateTimeEntryDto) {
    // Verify job exists and belongs to company
    const job = await this.prisma.job.findFirst({
      where: { id: createTimeEntryDto.jobId, companyId },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${createTimeEntryDto.jobId} not found`);
    }

    // Verify user exists and belongs to company
    const user = await this.prisma.user.findFirst({
      where: { id: createTimeEntryDto.userId, companyId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${createTimeEntryDto.userId} not found`);
    }

    const date = createTimeEntryDto.date ? new Date(createTimeEntryDto.date) : new Date();
    
    return this.prisma.timeEntry.create({
      data: {
        ...createTimeEntryDto,
        companyId,
        date,
        billable: createTimeEntryDto.billable ?? true,
      },
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(companyId: string, jobId?: string, userId?: string, startDate?: string, endDate?: string) {
    const where: any = { companyId };
    
    if (jobId) where.jobId = jobId;
    if (userId) where.userId = userId;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.timeEntry.findMany({
      where,
      include: {
        job: { 
          select: { 
            id: true, 
            title: true,
          } 
        },
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const timeEntry = await this.prisma.timeEntry.findFirst({
      where: { id, companyId },
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }
    return timeEntry;
  }

  async update(id: string, companyId: string, updateTimeEntryDto: UpdateTimeEntryDto) {
    await this.findOne(id, companyId);
    const data: any = { ...updateTimeEntryDto };
    
    if (updateTimeEntryDto.date) {
      data.date = new Date(updateTimeEntryDto.date);
    }

    return this.prisma.timeEntry.update({
      where: { id },
      data,
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.timeEntry.delete({
      where: { id },
    });
  }

  async getTotalHoursByJob(companyId: string, jobId: string) {
    const result = await this.prisma.timeEntry.aggregate({
      where: {
        companyId,
        jobId,
      },
      _sum: {
        hours: true,
      },
    });
    return {
      jobId,
      totalHours: result._sum.hours || 0,
    };
  }

  async getTotalBillableHours(companyId: string, jobId?: string, startDate?: string, endDate?: string) {
    const where: any = {
      companyId,
      billable: true,
    };
    
    if (jobId) where.jobId = jobId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const result = await this.prisma.timeEntry.aggregate({
      where,
      _sum: {
        hours: true,
      },
    });

    return {
      totalBillableHours: result._sum.hours || 0,
    };
  }
}

