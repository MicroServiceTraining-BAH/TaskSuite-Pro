import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  create(@User() user: any, @Body() createTimeEntryDto: CreateTimeEntryDto) {
    return this.timeEntriesService.create(user.companyId, createTimeEntryDto);
  }

  @Get()
  findAll(
    @User() user: any,
    @Query('jobId') jobId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeEntriesService.findAll(user.companyId, jobId, userId, startDate, endDate);
  }

  @Get('summary/job/:jobId')
  getTotalHoursByJob(@User() user: any, @Param('jobId') jobId: string) {
    return this.timeEntriesService.getTotalHoursByJob(user.companyId, jobId);
  }

  @Get('summary/billable')
  getTotalBillableHours(
    @User() user: any,
    @Query('jobId') jobId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeEntriesService.getTotalBillableHours(user.companyId, jobId, startDate, endDate);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.timeEntriesService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateTimeEntryDto: UpdateTimeEntryDto,
  ) {
    return this.timeEntriesService.update(id, user.companyId, updateTimeEntryDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.timeEntriesService.remove(id, user.companyId);
  }
}

