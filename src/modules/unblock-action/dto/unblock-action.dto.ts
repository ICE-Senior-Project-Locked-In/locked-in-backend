import { createZodDto } from "nestjs-zod";
import {
    unblockActionListResponseSchema,
    unblockActionResponseSchema,
    userUnblockActionListResponseSchema,
    userUnblockActionResponseSchema,
    createUnblockActionSchema,
    createUserUnblockActionSchema,
    deleteUserUnblockActionSchema,
} from "@/schemas/unblock-action.schema";

export class UnblockActionResponseDto extends createZodDto(unblockActionResponseSchema) { }
export class UnblockActionListResponseDto extends createZodDto(unblockActionListResponseSchema) { }
export class UserUnblockActionResponseDto extends createZodDto(userUnblockActionResponseSchema) { }
export class UserUnblockActionListResponseDto extends createZodDto(userUnblockActionListResponseSchema) { }
export class CreateUnblockActionDto extends createZodDto(createUnblockActionSchema) { }
export class CreateUserUnblockActionDto extends createZodDto(createUserUnblockActionSchema) { }
export class DeleteUserUnblockActionParamsDto extends createZodDto(deleteUserUnblockActionSchema) { }