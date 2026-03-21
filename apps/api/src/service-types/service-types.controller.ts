import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('service-types')
@UseGuards(JwtAuthGuard)
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  create(@User() user: any, @Body() dto: CreateServiceTypeDto) {
    return this.serviceTypesService.create(user.companyId, dto);
  }

  @Get()
  findAll(@User() user: any) {
    return this.serviceTypesService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.serviceTypesService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(@User() user: any, @Param('id') id: string, @Body() dto: UpdateServiceTypeDto) {
    return this.serviceTypesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.serviceTypesService.remove(id, user.companyId);
  }
}
