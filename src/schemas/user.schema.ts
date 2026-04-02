import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class UserValidation {
    static readonly userIdSchema = z.uuid("Invalid user ID format");
    static readonly nameSchema = z.string().min(1, "Name filter must be at least 1 character");
    static readonly balanceSchema = z.number().int("Balance must be an integer").min(0, "Balance must be a non-negative number");
    static readonly excludeCurrentUserSchema = z.boolean();
}

export const userSchema = z.object({
    userId: z.uuid(),
    email: z.email(),
    name: z.string().min(1).nullable(),
    balance: z.number().int().min(0),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
})

export const userResponseSchema = createApiResponseSchema(userSchema);
export const userListResponseSchema = createApiResponseSchema(z.array(userSchema));

export const updateUserSchema = z.object({
    name: UserValidation.nameSchema.optional(),
    balance: UserValidation.balanceSchema.optional(),
});

export type UserData = z.infer<typeof userSchema>;

export const userFiltersSchema = z.object({
    name: UserValidation.nameSchema.optional(),
    excludeCurrentUser: UserValidation.excludeCurrentUserSchema.optional(),
});

export const userIdParamSchema = z.object({
    userId: UserValidation.userIdSchema,
});