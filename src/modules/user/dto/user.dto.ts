import { createZodDto } from "nestjs-zod";
import {
    userResponseSchema,
    userListResponseSchema,
    userFiltersSchema,
    userIdParamSchema,
} from "@/schemas/user.schema";
import { paginationQuerySchema } from "@/schemas/pagination.schema";

export class UserResponseDto extends createZodDto(userResponseSchema) { }
export class UserListResponseDto extends createZodDto(userListResponseSchema) { }
export class UserFiltersDto extends createZodDto(userFiltersSchema.extend(paginationQuerySchema.shape)) { }
export class UserIdParamDto extends createZodDto(userIdParamSchema) { }