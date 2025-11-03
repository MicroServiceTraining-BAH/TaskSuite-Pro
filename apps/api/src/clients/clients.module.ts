import { Module } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";
import { ClientsPortalController } from "./clients-portal.controller";

@Module({
  controllers: [ClientsController, ClientsPortalController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}

