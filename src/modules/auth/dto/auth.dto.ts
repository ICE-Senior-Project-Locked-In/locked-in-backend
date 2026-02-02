import { createZodDto } from "nestjs-zod";
import {
    loginSchema,
    registerSchema,
    authResponseSchema,
    currentUserResponseSchema
} from "@/schemas/auth.schema";

export class LoginDto extends createZodDto(loginSchema) { }
export class RegisterDto extends createZodDto(registerSchema) { }
export class AuthResponseDto extends createZodDto(authResponseSchema) { }
export class CurrentUserResponseDto extends createZodDto(currentUserResponseSchema) { }