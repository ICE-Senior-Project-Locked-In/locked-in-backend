import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class UserFilterValidation {
    static readonly userIdSchema = z.uuid("Invalid user ID format");
    static readonly nameSchema = z.string().min(1, "Name filter must be at least 1 character").optional();
    static readonly excludeCurrentUserSchema = z.boolean().optional();
}

export const userSchema = z.object({
    userId: z.uuid(),
    email: z.email(),
    name: z.string().min(1).nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
})

export const userResponseSchema = createApiResponseSchema(userSchema);
export const userListResponseSchema = createApiResponseSchema(z.array(userSchema));

export type UserData = z.infer<typeof userSchema>;

export const userFiltersSchema = z.object({
    name: UserFilterValidation.nameSchema,
    excludeCurrentUser: UserFilterValidation.excludeCurrentUserSchema,
});

export const userIdParamSchema = z.object({
    userId: UserFilterValidation.userIdSchema,
});