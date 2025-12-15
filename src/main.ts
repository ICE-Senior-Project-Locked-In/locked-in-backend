import "reflect-metadata";
import type { Request, Response } from "express";
import { NestFactory } from "@nestjs/core";
import { RequestMethod, VersioningType } from '@nestjs/common';
import { SwaggerModule } from "@nestjs/swagger";
import { config } from "@/config/env";
import { AppModule } from './app.module';
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { ZodValidationPipe } from "nestjs-zod";
import { buildSwaggerConfig } from "@/docs/swagger";
import { AppLogger } from './logger/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const appLogger = app.get(AppLogger);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`, "cdnjs.cloudflare.com"],
          scriptSrc: [
            `'self'`,
            `'unsafe-inline'`,
            `'unsafe-eval'`,
            "cdnjs.cloudflare.com",
          ],
          imgSrc: [`'self'`, "data:", "validator.swagger.io"],
          fontSrc: [`'self'`, "cdnjs.cloudflare.com"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  app.useGlobalPipes(new ZodValidationPipe());

  const corsOptions: cors.CorsOptions = {
    origin: config.cors.allowedOrigins
      ? (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        if (config.cors.allowedOrigins!.includes(origin)) {
          return callback(null, true);
        }
        return callback(
          new Error(`Origin ${origin} not allowed by CORS policy`),
          false
        );
      }
      : true,
    credentials: config.cors.allowCredentials,
  };

  app.use(cookieParser());
  app.useLogger(appLogger);
  app.enableCors(corsOptions);

  app.setGlobalPrefix("api", {
    exclude: [
      { path: "", method: RequestMethod.GET },
      { path: "openapi.json", method: RequestMethod.ALL },
      { path: "docs", method: RequestMethod.ALL },
    ],
  })

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    buildSwaggerConfig()
  );
  SwaggerModule.setup("docs", app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "Mana MES API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js",
    ],
  });
  const httpServer = app.getHttpAdapter().getInstance();
  httpServer.get("/openapi.json", (_req: Request, res: Response) => {
    res.json(swaggerDocument);
  });

  process.on("unhandledRejection", (reason) => {
    appLogger.error({ reason }, "Unhandled promise rejection");
  });

  process.on("uncaughtException", (error) => {
    appLogger.error({ error }, "Uncaught exception");
  });

  await app.listen(config.port);

  appLogger.info(
    { port: config.port },
    `Backend is running on: http://localhost:${config.port}`
  )
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});