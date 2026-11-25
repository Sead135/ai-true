import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const origins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3001")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
  });
  app.use(json({ limit: "100kb" }));
  app.use(urlencoded({ extended: true, limit: "100kb" }));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("II Analytics API")
    .setDescription(
      "Аналитический кабинет «Истинный интеллект». Auth: httpOnly cookies `access_token` / `refresh_token` (Bearer тоже принимается).",
    )
    .setVersion("0.1.0")
    .addCookieAuth("access_token")
    .addCookieAuth("refresh_token")
    .addBearerAuth()
    .build();

  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
