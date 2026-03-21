import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      console.error("Please ensure PostgreSQL is running on localhost:5432");
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

