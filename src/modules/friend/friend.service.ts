import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { PaginationHelper, PaginationOptions, PaginatedResponse } from "@/common/helper/pagination.helper";
import { Prisma, User, Friendship, FriendshipStatus } from "@prisma/client";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { LeaderboardQuery, LeaderboardEntry } from "@/schemas/friend.schema";

@Injectable()
export class FriendService {
    constructor(private readonly prismaService: PrismaService) { }

    private async ensureOwnership(userId: string, friendshipId: string) {
        const where: Prisma.FriendshipWhereInput = {
            friendshipId,
            OR: [
                { senderId: userId },
                { receiverId: userId },
            ],
        };

        const exists = await this.prismaService.friendship.findFirst({ where });
        if (!exists) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: "Friendship not found for the user",
                code: "FRIENDSHIP_NOT_FOUND",
            });
        }
    }

    async getFriends(userId: string, paginationOptions?: PaginationOptions): Promise<PaginatedResponse<User>> {
        const where: Prisma.FriendshipWhereInput = {
            status: FriendshipStatus.ACCEPTED,
            OR: [
                { senderId: userId },
                { receiverId: userId },
            ],
        };

        const offset = PaginationHelper.getOffset(paginationOptions);

        const [friendships, total] = await Promise.all([
            this.prismaService.friendship.findMany({
                where,
                include: {
                    sender: true,
                    receiver: true,
                },
                ...offset,
            }),
            this.prismaService.friendship.count({ where }),
        ]);

        const friends = friendships.map(friendship =>
            friendship.senderId === userId ? friendship.receiver : friendship.sender
        );

        return {
            data: friends,
            pagination: PaginationHelper.getMetaData(total, paginationOptions),
        };
    }

    async createFriendRequest(senderId: string, receiverId: string): Promise<Friendship> {
        return this.prismaService.friendship.create({
            data: {
                senderId,
                receiverId,
                status: FriendshipStatus.PENDING,
            }
        })
    }

    async updateFriendRequest(userId: string, friendshipId: string, status: FriendshipStatus): Promise<Friendship> {
        await this.ensureOwnership(userId, friendshipId);
        
        return this.prismaService.friendship.update({
            where: { friendshipId },
            data: { status },
        });
    }

    async deleteFriendship(userId: string,friendshipId: string): Promise<void> {
        await this.ensureOwnership(userId, friendshipId);

        await this.prismaService.friendship.delete({
            where: { friendshipId },
        });
    }

    async getLeaderboard(userId: string, query: LeaderboardQuery): Promise<LeaderboardEntry[]> {
        const friendships = await this.prismaService.friendship.findMany({
            where: {
                status: FriendshipStatus.ACCEPTED,
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            select: { senderId: true, receiverId: true },
        });

        const friendIds = friendships.map(f =>
            f.senderId === userId ? f.receiverId : f.senderId
        );
        const participantIds = [userId, ...friendIds];

        const logWhere: Prisma.FocusLogWhereInput = {
            userId: { in: participantIds },
            endTime: { not: null },
            ...(query.startDate || query.endDate
                ? {
                    startTime: {
                        ...(query.startDate && { gte: query.startDate }),
                        ...(query.endDate && { lte: query.endDate }),
                    },
                }
                : {}),
        };

        const logs = await this.prismaService.focusLog.findMany({ where: logWhere });

        const durationMap = new Map<string, number>(participantIds.map(id => [id, 0]));
        for (const log of logs) {
            const seconds = Math.floor((log.endTime!.getTime() - log.startTime.getTime()) / 1000);
            durationMap.set(log.userId, (durationMap.get(log.userId) ?? 0) + seconds);
        }

        const sorted = [...durationMap.entries()].sort((a, b) => b[1] - a[1]);

        const ranked: Array<{ userId: string; totalFocusTime: number; rank: number }> = [];
        let currentRank = 1;
        for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i][1] < sorted[i - 1][1]) currentRank = i + 1;
            ranked.push({ userId: sorted[i][0], totalFocusTime: sorted[i][1], rank: currentRank });
        }

        let result = ranked;
        if (query.top !== undefined) {
            const topSlice = ranked.slice(0, query.top);
            const currentUserInTop = topSlice.some(e => e.userId === userId);
            if (!currentUserInTop) {
                const currentUserEntry = ranked.find(e => e.userId === userId);
                result = currentUserEntry ? [...topSlice, currentUserEntry] : topSlice;
            } else {
                result = topSlice;
            }
        }

        const resultUserIds = result.map(e => e.userId);
        const users = await this.prismaService.user.findMany({
            where: { userId: { in: resultUserIds } },
        });
        const userMap = new Map(users.map(u => [u.userId, u]));

        return result.map(entry => {
            const user = userMap.get(entry.userId)!;
            return {
                rank: entry.rank,
                totalFocusTime: entry.totalFocusTime,
                user: {
                    ...user,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                },
            };
        });
    }
}

