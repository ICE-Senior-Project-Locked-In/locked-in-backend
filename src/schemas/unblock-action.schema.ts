import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class UnblockActionValidation {
    static readonly actionIdSchema = z.uuid("Invalid unblock action ID format");
    static readonly nameSchema = z.string().min(1, "Unblock action name is required");
}

export const unblockActionSchema = z.object({
    actionId: z.uuid(),
    name: z.string(),
    isDefault: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const userUnblockActionSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    actionId: z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const unblockActionResponseSchema = createApiResponseSchema(unblockActionSchema);
export const unblockActionListResponseSchema = createApiResponseSchema(z.array(unblockActionSchema));
export const userUnblockActionResponseSchema = createApiResponseSchema(userUnblockActionSchema);
export const userUnblockActionListResponseSchema = createApiResponseSchema(z.array(userUnblockActionSchema));

export type UnblockActionData = z.infer<typeof unblockActionSchema>;
export type UserUnblockActionData = z.infer<typeof userUnblockActionSchema>;

export const createUnblockActionSchema = z.object({
    name: UnblockActionValidation.nameSchema,
});

export const createUserUnblockActionSchema = z.object({
    actionId: UnblockActionValidation.actionIdSchema,
});

export const deleteUserUnblockActionSchema = z.object({
    actionId: UnblockActionValidation.actionIdSchema,
});