import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}

