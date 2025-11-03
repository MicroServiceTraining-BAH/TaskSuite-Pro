import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { CompaniesModule } from "./companies/companies.module";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { EstimatesModule } from "./estimates/estimates.module";
import { JobsModule } from "./jobs/jobs.module";
import { AppointmentsModule } from "./appointments/appointments.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { PrismaModule } from "./prisma/prisma.module";
import { MultiTenantModule } from "./multi-tenant/multi-tenant.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { EmailModule } from "./email/email.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    MultiTenantModule,
    CompaniesModule,
    UsersModule,
    ClientsModule,
    EstimatesModule,
    JobsModule,
    AppointmentsModule,
    InvoicesModule,
    HealthModule,
    AuthModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

