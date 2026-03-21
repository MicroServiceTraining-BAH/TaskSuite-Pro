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
import { TaxRatesService } from './tax-rates.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('tax-rates')
@UseGuards(JwtAuthGuard)
export class TaxRatesController {
  constructor(private readonly taxRatesService: TaxRatesService) {}

  @Post()
  create(@User() user: any, @Body() createTaxRateDto: CreateTaxRateDto) {
    return this.taxRatesService.create(user.companyId, createTaxRateDto);
  }

  @Get()
  findAll(@User() user: any, @Query('isActive') isActive?: string) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.taxRatesService.findAll(user.companyId, active);
  }

  @Get('default')
  getDefault(@User() user: any) {
    return this.taxRatesService.getDefaultRate(user.companyId);
  }

  @Get(':id')
  findOne(@User() user: any, @Param('id') id: string) {
    return this.taxRatesService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @User() user: any,
    @Param('id') id: string,
    @Body() updateTaxRateDto: UpdateTaxRateDto,
  ) {
    return this.taxRatesService.update(id, user.companyId, updateTaxRateDto);
  }

  @Delete(':id')
  remove(@User() user: any, @Param('id') id: string) {
    return this.taxRatesService.remove(id, user.companyId);
  }
}

