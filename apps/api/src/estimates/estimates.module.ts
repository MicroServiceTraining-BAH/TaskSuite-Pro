import { Module } from "@nestjs/common";
import { EstimatesService } from "./estimates.service";
import { EstimatesController } from "./estimates.controller";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [EstimatesController],
  providers: [EstimatesService],
  exports: [EstimatesService],
})
export class EstimatesModule {}

