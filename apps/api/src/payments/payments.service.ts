import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2025-10-29.clover',
      });
    }
  }

  async createPaymentIntent(invoiceId: string, companyId: string, amount?: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: { client: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice is already paid');
    }

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const paymentAmount = amount || invoice.amount;
    const amountInCents = Math.round(paymentAmount * 100); // Stripe uses cents

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        invoiceId,
        companyId,
        clientId: invoice.clientId,
        invoiceNumber: invoice.invoiceNumber,
      },
      description: `Payment for invoice ${invoice.invoiceNumber}`,
    });

    // Store payment intent in database
    await this.prisma.payment.create({
      data: {
        invoiceId,
        companyId,
        amount: paymentAmount,
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        paymentMethod: 'stripe',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string, companyId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata.companyId !== companyId) {
      throw new NotFoundException('Payment intent not found');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { paymentIntentId, companyId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Mark invoice as paid
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

      return { success: true, message: 'Payment confirmed' };
    }

    return { success: false, status: paymentIntent.status };
  }

  async getPaymentStatus(paymentId: string, companyId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, companyId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.paymentIntentId && this.stripe) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(payment.paymentIntentId);
        return {
          ...payment,
          stripeStatus: paymentIntent.status,
        };
      } catch (error) {
        // If Stripe retrieval fails, return payment status from DB
      }
    }

    return payment;
  }

  async findAll(companyId: string, invoiceId?: string) {
    const where: any = { companyId };
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }
    return this.prisma.payment.findMany({
      where,
      include: { invoice: { select: { id: true, invoiceNumber: true, amount: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

