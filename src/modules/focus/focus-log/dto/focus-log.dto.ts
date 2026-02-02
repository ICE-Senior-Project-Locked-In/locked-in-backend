import { createZodDto } from "nestjs-zod";
import {
    focusLogResponseSchema,
    focusLogListResponseSchema,
    focusLogIdParamsSchema,
    startFocusLogSchema,
    endFocusLogSchema,
} from "@/schemas/focus-log.schema";

export class FocusLogResponseDto extends createZodDto(focusLogResponseSchema) { }
export class FocusLogListResponseDto extends createZodDto(focusLogListResponseSchema) { }
export class FocusLogIdParamsDto extends createZodDto(focusLogIdParamsSchema) { }
export class StartFocusLogDto extends createZodDto(startFocusLogSchema) { }
export class EndFocusLogDto extends createZodDto(endFocusLogSchema) { }