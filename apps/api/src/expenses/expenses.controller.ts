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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@User() user: any, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(user.companyId, createExpenseDto);
  }

  @Get()
  findAll(
    @User() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
  ) {
    return this.expensesService.findAll(user.companyId, startDate, endDate, accountId);
  }

  @Get('summary')
  getSummary(
    @User() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getTotalByAccount(user.companyId, startDate, endDate);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.expensesService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, user.companyId, updateExpenseDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.expensesService.remove(id, user.companyId);
  }
}

