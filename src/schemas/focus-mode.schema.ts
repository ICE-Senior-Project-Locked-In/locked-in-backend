import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class FocusModeValidation {
    static readonly modeIdSchema = z.uuid("Invalid focus mode ID format");
    static readonly titleSchema = z.string().min(1, "Focus mode title is required");
    static readonly blackListedAppsSchema = z.array(z.string());
    static readonly userUnblockActionIdSchema = z.uuid("Invalid user unblock action ID format");
}

export const focusModeSchema = z.object({
    modeId: z.uuid(),
    userId: z.uuid(),
    title: z.string(),
    blackListedApps: z.array(z.string()),
    userUnblockActionId: z.uuid().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const focusModeResponseSchema = createApiResponseSchema(focusModeSchema);
export const focusModeListResponseSchema = createApiResponseSchema(z.array(focusModeSchema));

export type FocusModeData = z.infer<typeof focusModeSchema>;

export const createFocusModeSchema = z.object({
    title: FocusModeValidation.titleSchema,
    blackListedApps: FocusModeValidation.blackListedAppsSchema.optional().default([]),
    userUnblockActionId: FocusModeValidation.userUnblockActionIdSchema.optional(),
});

export const updateFocusModeSchema = z.object({
    title: FocusModeValidation.titleSchema.optional(),
    blackListedApps: FocusModeValidation.blackListedAppsSchema.optional(),
    userUnblockActionId: FocusModeValidation.userUnblockActionIdSchema.optional(),
});

export const focusModeIdParamsSchema = z.object({
    modeId: FocusModeValidation.modeIdSchema,
});
