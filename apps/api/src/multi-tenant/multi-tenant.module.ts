import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { MultiTenantMiddleware } from "./multi-tenant.middleware";

@Module({})
export class MultiTenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MultiTenantMiddleware).forRoutes("*");
  }
}

