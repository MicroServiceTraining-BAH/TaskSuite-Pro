import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEstimateDto } from "./dto/create-estimate.dto";
import { UpdateEstimateDto } from "./dto/update-estimate.dto";
import { EmailService } from "../email/email.service";
import { SmsService } from "../sms/sms.service";
import * as crypto from "crypto";

@Injectable()
export class EstimatesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  async create(companyId: string, createEstimateDto: CreateEstimateDto) {
    let amount = createEstimateDto.amount || 0;
    const taxRate = createEstimateDto.taxRate || 0;

    // Calculate amount from line items if provided
    if (createEstimateDto.lineItems && createEstimateDto.lineItems.length > 0) {
      amount = createEstimateDto.lineItems.reduce((total, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTax = itemTotal * (item.taxRate || taxRate);
        return total + itemTotal + itemTax;
      }, 0);
    }

    // Generate a secure public token for viewing/approving without login
    const publicToken = crypto.randomBytes(32).toString("hex");

    // Try to ensure the publicToken column exists (for migration compatibility)
    // This allows the code to work even if the migration hasn't been run yet
    try {
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "Estimate" ADD COLUMN IF NOT EXISTS "publicToken" TEXT;
      `);
    } catch (error) {
      // Column might already exist, ignore
    }
    
    try {
      // Check if index exists before creating (PostgreSQL doesn't support IF NOT EXISTS for CREATE INDEX)
      const indexCheck = await this.prisma.$queryRawUnsafe(`
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Estimate_publicToken_key';
      `);
      if (!indexCheck || (Array.isArray(indexCheck) && indexCheck.length === 0)) {
        await this.prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX "Estimate_publicToken_key" ON "Estimate"("publicToken");
        `);
      }
    } catch (error) {
      // Index might already exist or other error, ignore
    }

    const estimate = await this.prisma.estimate.create({
      data: {
        clientId: createEstimateDto.clientId,
        title: createEstimateDto.title,
        description: createEstimateDto.description,
        amount,
        taxRate,
        status: createEstimateDto.status,
        estimateType: createEstimateDto.estimateType,
        serviceTypeId: createEstimateDto.serviceTypeId || null,
        metadata: createEstimateDto.metadata || null,
        publicToken,
        companyId,
      },
      include: { client: true, lineItems: true },
    });

    // Create line items if provided
    if (createEstimateDto.lineItems && createEstimateDto.lineItems.length > 0) {
      await Promise.all(
        createEstimateDto.lineItems.map((item) =>
          this.prisma.estimateLineItem.create({
            data: {
              estimateId: estimate.id,
              companyId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate || taxRate,
            },
          })
        )
      );
    }

    // Reload estimate with line items
    const estimateWithItems = await this.findOne(estimate.id, companyId);

    // Send email notification if requested and client has email
    if (createEstimateDto.sendEmail) {
      if (estimateWithItems.client.email) {
        console.log(`📧 Sending estimate email to client: ${estimateWithItems.client.name} (${estimateWithItems.client.email})`);
        const emailResult = await this.emailService.sendEstimateNotification(
          estimateWithItems.client.email,
          estimateWithItems.title,
          estimateWithItems.publicToken!
        );
        if (!emailResult) {
          console.warn(`⚠️  Email notification failed. Check SMTP configuration and API server logs.`);
        }
      } else {
        console.warn(`⚠️  Email requested but client "${estimateWithItems.client.name}" has no email address`);
      }
    } else {
      console.log(`ℹ️  Email notification not requested (sendEmail checkbox was not checked)`);
    }

    // Send SMS notification if requested and client has phone
    if (createEstimateDto.sendText) {
      if (estimateWithItems.client.phone) {
        console.log(`📱 Sending estimate SMS to client: ${estimateWithItems.client.name} (${estimateWithItems.client.phone})`);
        await this.smsService.sendEstimateNotification(
          estimateWithItems.client.phone,
          estimateWithItems.title,
          estimateWithItems.publicToken!
        );
      } else {
        console.warn(`⚠️  SMS requested but client "${estimateWithItems.client.name}" has no phone number`);
      }
    }

    return estimateWithItems;
  }

  async findAll(companyId: string) {
    return this.prisma.estimate.findMany({
      where: { companyId },
      include: { client: true, lineItems: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const estimate = await this.prisma.estimate.findFirst({
      where: { id, companyId },
      include: { client: true, lineItems: true },
    });
    if (!estimate) {
      throw new NotFoundException(`Estimate with ID ${id} not found`);
    }
    return estimate;
  }

  async update(id: string, companyId: string, updateEstimateDto: UpdateEstimateDto) {
    await this.findOne(id, companyId);
    
    // If line items exist, recalculate amount
    const estimate = await this.findOne(id, companyId);
    let amount = updateEstimateDto.amount;
    
    if (estimate.lineItems && estimate.lineItems.length > 0) {
      const taxRate = updateEstimateDto.taxRate ?? estimate.taxRate;
      amount = estimate.lineItems.reduce((total, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTax = itemTotal * (item.taxRate || taxRate);
        return total + itemTotal + itemTax;
      }, 0);
    }
    
    const updateData: any = { ...updateEstimateDto };
    delete updateData.companyId; // Remove companyId as it's not updatable
    delete updateData.lineItems; // Line items are managed separately
    
    if (amount !== undefined) {
      updateData.amount = amount;
    }
    
    return this.prisma.estimate.update({
      where: { id },
      data: updateData,
      include: { client: true, lineItems: true },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.estimate.delete({
      where: { id },
    });
  }

  // Public endpoint - get estimate by token (no auth required)
  async findByPublicToken(token: string) {
    const estimate = await this.prisma.estimate.findUnique({
      where: { publicToken: token },
      include: { 
        client: { select: { id: true, name: true, email: true, phone: true } },
        lineItems: true,
        company: { select: { id: true, name: true } }
      },
    });
    if (!estimate) {
      throw new NotFoundException("Estimate not found");
    }
    return estimate;
  }

  // Public endpoint - approve estimate by token
  async approveByToken(token: string) {
    const estimate = await this.findByPublicToken(token);
    if (estimate.status === "accepted") {
      throw new BadRequestException("Estimate has already been accepted");
    }
    if (estimate.status === "converted") {
      throw new BadRequestException("Estimate has already been converted to a job");
    }
    return this.prisma.estimate.update({
      where: { publicToken: token },
      data: { status: "accepted" },
      include: { client: true, lineItems: true },
    });
  }

  // Public endpoint - reject estimate by token
  async rejectByToken(token: string) {
    const estimate = await this.findByPublicToken(token);
    if (estimate.status === "rejected") {
      throw new BadRequestException("Estimate has already been rejected");
    }
    if (estimate.status === "converted") {
      throw new BadRequestException("Estimate has already been converted to a job");
    }
    return this.prisma.estimate.update({
      where: { publicToken: token },
      data: { status: "rejected" },
      include: { client: true, lineItems: true },
    });
  }

  async convertToJob(estimateId: string, companyId: string) {
    const estimate = await this.findOne(estimateId, companyId);
    
    if (estimate.status === "converted") {
      throw new BadRequestException("Estimate has already been converted to a job");
    }

    // Only allow converting approved estimates
    if (estimate.status !== "accepted") {
      throw new BadRequestException(
        `Cannot convert estimate to job. Estimate must be approved by the client first. Current status: ${estimate.status}`
      );
    }

    // Create job from estimate
    const job = await this.prisma.job.create({
      data: {
        companyId,
        clientId: estimate.clientId,
        estimateId: estimate.id,
        title: estimate.title,
        description: estimate.description,
        status: "pending",
        jobType: estimate.estimateType || null, // Pass estimate type as job type
      },
    });

    // Update estimate status
    await this.prisma.estimate.update({
      where: { id: estimateId },
      data: { status: "converted" },
    });

    return job;
  }
}

