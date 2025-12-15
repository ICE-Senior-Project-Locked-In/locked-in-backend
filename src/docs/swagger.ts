import { DocumentBuilder } from "@nestjs/swagger";
import packageJson from "../../package.json";

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle("Locked In API")
    .setDescription("Locked In API reference")
    .setVersion(packageJson.version ?? "1.0.0")
    .addBearerAuth()
    .build();
}