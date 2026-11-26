import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { json, urlencoded, type NextFunction, type Request, type Response } from "express";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const origins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3001")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
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

  // Vercel serverless often omits swagger-ui-dist from the bundle; serve via CDN.
  const swaggerCdn = "https://unpkg.com/swagger-ui-dist@5.34.1";
  const swaggerFiles = new Set([
    "swagger-ui.css",
    "swagger-ui-bundle.js",
    "swagger-ui-standalone-preset.js",
    "favicon-32x32.png",
    "favicon-16x16.png",
  ]);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const match = /^\/docs\/([^/]+)$/.exec(req.path);
    if (match && swaggerFiles.has(match[1])) {
      res.redirect(302, `${swaggerCdn}/${match[1]}`);
      return;
    }
    next();
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Точки API")
    .setDescription(
      "Аналитический кабинет «Точки». Auth: httpOnly cookies `access_token` / `refresh_token` (Bearer тоже принимается).",
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
