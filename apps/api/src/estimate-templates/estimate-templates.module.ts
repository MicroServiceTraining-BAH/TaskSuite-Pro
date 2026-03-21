import { Module } from "@nestjs/common";
import { EstimateTemplatesService } from "./estimate-templates.service";
import { EstimateTemplatesController } from "./estimate-templates.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [EstimateTemplatesController],
  providers: [EstimateTemplatesService],
  exports: [EstimateTemplatesService],
})
export class EstimateTemplatesModule {}

