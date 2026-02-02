import { createZodDto } from "nestjs-zod";
import {
    createFocusTypeSchema,
    createUserFocusTypeSchema,
    deleteUserFocusTypeSchema,
    focusTypeResponseSchema,
    focusTypeListResponseSchema,
    userFocusTypeResponseSchema,
    userFocusTypeListResponseSchema,
} from "@/schemas/focus-type.schema";

export class FocusTypeResponseDto extends createZodDto(focusTypeResponseSchema) { }
export class FocusTypeListResponseDto extends createZodDto(focusTypeListResponseSchema) { }
export class UserFocusTypeResponseDto extends createZodDto(userFocusTypeResponseSchema) { }
export class UserFocusTypeListResponseDto extends createZodDto(userFocusTypeListResponseSchema) { }
export class CreateFocusTypeDto extends createZodDto(createFocusTypeSchema) { }
export class CreateUserFocusTypeDto extends createZodDto(createUserFocusTypeSchema) { }
export class DeleteUserFocusTypeParamsDto extends createZodDto(deleteUserFocusTypeSchema) { }
