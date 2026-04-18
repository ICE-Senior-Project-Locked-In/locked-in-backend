import { createZodDto } from "nestjs-zod";
import {
    createFocusModeSchema,
    updateFocusModeSchema,
    focusModeResponseSchema,
    focusModeListResponseSchema,
    focusModeIdParamsSchema,
} from "@/schemas/focus-mode.schema";

export class FocusModeResponseDto extends createZodDto(focusModeResponseSchema) { }
export class FocusModeListResponseDto extends createZodDto(focusModeListResponseSchema) { }
export class CreateFocusModeDto extends createZodDto(createFocusModeSchema) { }
export class UpdateFocusModeDto extends createZodDto(updateFocusModeSchema) { }
export class FocusModeIdParamsDto extends createZodDto(focusModeIdParamsSchema) { }
