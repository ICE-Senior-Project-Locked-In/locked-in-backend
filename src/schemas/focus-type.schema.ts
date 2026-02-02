import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class FocusTypeValidation {
    static readonly typeIdSchema = z.uuid("Invalid focus type ID format");
    static readonly nameSchema = z.string().min(1, "Focus type name is required");
}

export const focusTypeSchema = z.object({
    typeId: z.uuid(),
    name: z.string(),
    isDefault: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const userFocusTypeSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    typeId: z.uuid(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const focusTypeResponseSchema = createApiResponseSchema(focusTypeSchema);
export const focusTypeListResponseSchema = createApiResponseSchema(z.array(focusTypeSchema));
export const userFocusTypeResponseSchema = createApiResponseSchema(userFocusTypeSchema);
export const userFocusTypeListResponseSchema = createApiResponseSchema(z.array(userFocusTypeSchema));

export type FocusTypeData = z.infer<typeof focusTypeSchema>;
export type UserFocusTypeData = z.infer<typeof userFocusTypeSchema>;

export const createFocusTypeSchema = z.object({
    name: FocusTypeValidation.nameSchema,
});

export const createUserFocusTypeSchema = z.object({
    typeId: FocusTypeValidation.typeIdSchema,
});

export const deleteUserFocusTypeSchema = z.object({
    typeId: FocusTypeValidation.typeIdSchema,
});