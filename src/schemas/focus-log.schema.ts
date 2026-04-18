import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class FocusLogValidation {
    static readonly logIdSchema = z.uuid("Invalid focus log ID format");
    static readonly modeIdSchema = z.uuid("Invalid focus mode ID format");
    static readonly startTimeSchema = z.iso.datetime("Invalid start time format").transform((val) => new Date(val));
    static readonly endTimeSchema = z.iso.datetime("Invalid end time format").transform((val) => new Date(val));
}

export const focusLogSchema = z.object({
    logId: z.uuid(),
    userId: z.uuid(),
    modeId: z.uuid(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const focusLogResponseSchema = createApiResponseSchema(focusLogSchema);
export const focusLogListResponseSchema = createApiResponseSchema(z.array(focusLogSchema));

export type FocusLogData = z.infer<typeof focusLogSchema>;

export const startFocusLogSchema = z.object({
    modeId: FocusLogValidation.modeIdSchema,
    startTime: FocusLogValidation.startTimeSchema,
});

export const endFocusLogSchema = z.object({
    endTime: FocusLogValidation.endTimeSchema,
});

export const focusLogIdParamsSchema = z.object({
    logId: FocusLogValidation.logIdSchema,
});
