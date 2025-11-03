import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS with environment allowlist
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000"];

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });

  // Rate limiting - configured in app.module.ts

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // OpenAPI/Swagger
  const config = new DocumentBuilder()
    .setTitle("TaskSuite Pro API")
    .setDescription("TaskSuite Pro API documentation")
    .setVersion("1.0")
    .addTag("companies")
    .addTag("users")
    .addTag("clients")
    .addTag("estimates")
    .addTag("jobs")
    .addTag("appointments")
    .addTag("invoices")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API server running on http://localhost:${port}`);
  console.log(`📚 API docs available at http://localhost:${port}/api`);
}
bootstrap();

