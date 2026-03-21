import { Module } from "@nestjs/common";
import { EstimatesService } from "./estimates.service";
import { EstimatesController, PublicEstimatesController } from "./estimates.controller";
import { EmailModule } from "../email/email.module";
import { SmsModule } from "../sms/sms.module";

@Module({
  imports: [EmailModule, SmsModule],
  controllers: [EstimatesController, PublicEstimatesController],
  providers: [EstimatesService],
  exports: [EstimatesService],
})
export class EstimatesModule {}

