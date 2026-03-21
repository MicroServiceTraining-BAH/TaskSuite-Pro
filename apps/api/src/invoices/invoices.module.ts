import { Module } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { InvoicesController } from "./invoices.controller";
import { InvoiceLineItemsController } from "./invoice-line-items.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { SmsModule } from "../sms/sms.module";

@Module({
  imports: [PrismaModule, EmailModule, SmsModule],
  controllers: [InvoicesController, InvoiceLineItemsController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}

