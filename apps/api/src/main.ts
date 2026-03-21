import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from uploads directory
  // In development: src/uploads, in production: dist/uploads
  const uploadsPath = process.env.NODE_ENV === 'production' 
    ? join(process.cwd(), 'uploads')
    : join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Security
  app.use(helmet());

  // CORS with environment allowlist
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000", "http://localhost:3001"];

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, log the origin for debugging
        if (process.env.NODE_ENV !== "production") {
          console.log(`CORS blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
        }
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Company-Id"],
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

