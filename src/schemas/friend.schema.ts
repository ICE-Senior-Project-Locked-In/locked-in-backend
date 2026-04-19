import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";
import { userSchema } from "./user.schema";
import { FriendshipStatus } from "@prisma/client";

export class FriendshipValidation {
    static readonly friendshipIdSchema = z.uuid("Invalid friendship ID format");
    static readonly receiverIdSchema = z.uuid("Invalid receiver ID format");
    static readonly statusSchema = z.enum(FriendshipStatus, {
        error: "Invalid friendship status",
    });
}

export const friendSchema = userSchema;

export const friendshipSchema = z.object({
    friendshipId: z.uuid(),
    senderId: z.uuid(),
    receiverId: z.uuid(),
    status: z.enum(FriendshipStatus),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const friendResponseSchema = createApiResponseSchema(friendSchema);
export const friendshipResponseSchema = createApiResponseSchema(friendshipSchema);

export type FriendData = z.infer<typeof friendSchema>;

export const friendFiltersSchema = z.object({});

export const createFriendRequestParamsSchema = z.object({
    receiverId: FriendshipValidation.receiverIdSchema,
});

export const updateFriendRequestParamsSchema = z.object({
    friendshipId: FriendshipValidation.friendshipIdSchema,
});

export const updateFriendRequestQuerySchema = z.object({
    status: FriendshipValidation.statusSchema,
})

export const deleteFriendshipParamsSchema = z.object({
    friendshipId: FriendshipValidation.friendshipIdSchema,
});

export const leaderboardQuerySchema = z.object({
    startDate: z.iso.datetime().transform((val) => new Date(val)).optional(),
    endDate: z.iso.datetime().transform((val) => new Date(val)).optional(),
    top: z.coerce.number().int().positive().optional(),
});

export const leaderboardEntrySchema = z.object({
    rank: z.number().int().positive(),
    totalFocusTime: z.number().int().min(0),
    user: userSchema,
});

export const leaderboardResponseSchema = createApiResponseSchema(z.array(leaderboardEntrySchema));

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;