import { z } from "zod";
import { userSchema } from "./user.schema";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class AuthValidation {
    static readonly emailSchema = z.email("Invalid email format");
    static readonly passwordSchema = z
        .string()
        .min(6, "Password must be at least 6 characters");
    static readonly nameSchema = z.string().min(1, "Name is required").optional();
}

export const loginSchema = z.object({
    email: AuthValidation.emailSchema,
    password: AuthValidation.passwordSchema,
});
export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: AuthValidation.emailSchema,
    password: AuthValidation.passwordSchema,
    name: AuthValidation.nameSchema,
});
export type RegisterData = z.infer<typeof registerSchema>;

export const userIdSchema = z.object({
    userId: z.uuid(),
});
export type UserIdParams = z.infer<typeof userIdSchema>;

export const authPayloadSchema = z.object({
    user: userSchema,
    accessToken: z.string(),
});
export type AuthPayload = z.infer<typeof authPayloadSchema>;

export const authResponseSchema = createApiResponseSchema(authPayloadSchema);
export const currentUserResponseSchema = createApiResponseSchema(userSchema);