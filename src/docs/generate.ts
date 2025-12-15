import { writeFileSync } from "node:fs";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "../app.module";
import { buildSwaggerConfig } from "./swagger";

const outputPath = path.resolve(__dirname, "../../openapi.json");

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  await app.close();
  console.log(`OpenAPI spec written to ${outputPath}`);
}

generate().catch((error) => {
  console.error("Failed to generate OpenAPI spec", error);
  process.exit(1);
});
