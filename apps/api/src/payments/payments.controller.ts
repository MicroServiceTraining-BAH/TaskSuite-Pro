import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent/:invoiceId')
  createPaymentIntent(
    @User() user: any,
    @Param('invoiceId') invoiceId: string,
    @Body('amount') amount?: number,
  ) {
    return this.paymentsService.createPaymentIntent(invoiceId, user.companyId, amount);
  }

  @Post('confirm/:paymentIntentId')
  confirmPayment(
    @User() user: any,
    @Param('paymentIntentId') paymentIntentId: string,
  ) {
    return this.paymentsService.confirmPayment(paymentIntentId, user.companyId);
  }

  @Get('status/:paymentId')
  getPaymentStatus(
    @User() user: any,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentsService.getPaymentStatus(paymentId, user.companyId);
  }

  @Get()
  findAll(
    @User() user: any,
    @Query('invoiceId') invoiceId?: string,
  ) {
    return this.paymentsService.findAll(user.companyId, invoiceId);
  }
}

