import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class FocusLogValidation {
    static readonly logIdSchema = z.uuid("Invalid focus log ID format");
    static readonly typeIdSchema = z.uuid("Invalid focus type ID format");
    static readonly startTimeSchema = z.date("Invalid start time format");
    static readonly endTimeSchema = z.date("Invalid end time format");
}

export const focusLogSchema = z.object({
    logId: z.uuid(),
    userId: z.uuid(),
    typeId: z.uuid(),
    startTime: z.date(),
    endTime: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const focusLogResponseSchema = createApiResponseSchema(focusLogSchema);
export const focusLogListResponseSchema = createApiResponseSchema(z.array(focusLogSchema));

export type FocusLogData = z.infer<typeof focusLogSchema>;

export const startFocusLogSchema = z.object({
    typeId: FocusLogValidation.typeIdSchema,
    startTime: FocusLogValidation.startTimeSchema,
});

export const endFocusLogSchema = z.object({
    endTime: FocusLogValidation.endTimeSchema,
});

export const focusLogIdParamsSchema = z.object({
    logId: FocusLogValidation.logIdSchema,
});