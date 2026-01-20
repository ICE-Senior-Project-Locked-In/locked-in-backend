import { createZodDto } from "nestjs-zod";
import { emptyResponseSchema } from "../api/api.schema";

export class EmptyResponseDto extends createZodDto(emptyResponseSchema) {}