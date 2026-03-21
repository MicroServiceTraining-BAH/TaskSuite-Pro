import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit-loss')
  getProfitAndLoss(
    @User() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    return this.reportsService.getProfitAndLoss(user.companyId, start, end);
  }

  @Get('cash-flow')
  getCashFlow(
    @User() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    return this.reportsService.getCashFlow(user.companyId, start, end);
  }

  @Get('balance-sheet')
  getBalanceSheet(
    @User() user: any,
    @Query('asOfDate') asOfDate?: string,
  ) {
    const date = asOfDate ? new Date(asOfDate) : new Date();
    return this.reportsService.getBalanceSheet(user.companyId, date);
  }

  @Get('summary')
  getSummary(@User() user: any) {
    return this.reportsService.getSummary(user.companyId);
  }
}

