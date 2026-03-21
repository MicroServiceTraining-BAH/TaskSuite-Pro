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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@User() user: any, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(user.companyId, createAccountDto);
  }

  @Get()
  findAll(@User() user: any, @Query('type') type?: string) {
    return this.accountsService.findAll(user.companyId, type);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.accountsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, user.companyId, updateAccountDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.accountsService.remove(id, user.companyId);
  }
}

