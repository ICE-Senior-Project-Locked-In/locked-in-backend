import { createZodDto } from "nestjs-zod";
import {
    friendResponseSchema,
    friendFiltersSchema,
    friendshipResponseSchema,
    createFriendRequestParamsSchema,
    updateFriendRequestParamsSchema,
    updateFriendRequestQuerySchema,
    deleteFriendshipParamsSchema,
} from "@/schemas/friend.schema";
import { paginationQuerySchema } from "@/schemas/pagination.schema";

export class FriendResponseDto extends createZodDto(friendResponseSchema) { }
export class FriendFiltersDto extends createZodDto(friendFiltersSchema.extend(paginationQuerySchema.shape)) { }
export class FriendshipResponseDto extends createZodDto(friendshipResponseSchema) { }
export class CreateFriendRequestParamsDto extends createZodDto(createFriendRequestParamsSchema) { }
export class UpdateFriendRequestParamsDto extends createZodDto(updateFriendRequestParamsSchema) { }
export class UpdateFriendRequestQueryDto extends createZodDto(updateFriendRequestQuerySchema) { }
export class DeleteFriendshipParamsDto extends createZodDto(deleteFriendshipParamsSchema) { }