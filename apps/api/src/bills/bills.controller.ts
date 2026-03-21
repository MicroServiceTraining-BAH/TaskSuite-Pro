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
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  create(@User() user: any, @Body() createBillDto: CreateBillDto) {
    return this.billsService.create(user.companyId, createBillDto);
  }

  @Get()
  findAll(@User() user: any, @Query('status') status?: string) {
    return this.billsService.findAll(user.companyId, status);
  }

  @Post('update-overdue')
  updateOverdue(@User() user: any) {
    return this.billsService.updateOverdueBills(user.companyId);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.billsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateBillDto: UpdateBillDto,
  ) {
    return this.billsService.update(id, user.companyId, updateBillDto);
  }

  @Post(':id/mark-paid')
  markPaid(
    @User() user: any,
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod?: string,
  ) {
    return this.billsService.markPaid(id, user.companyId, paymentMethod);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.billsService.remove(id, user.companyId);
  }
}

