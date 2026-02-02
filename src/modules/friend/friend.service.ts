import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { PaginationHelper, PaginationOptions, PaginatedResponse } from "@/common/helper/pagination.helper";
import { Prisma, User, Friendship, FriendshipStatus } from "@prisma/client";
import { HttpApiException } from "@/common/exceptions/http-api.exception";

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
                message: "Focus log not found for the user",
                code: "FOCUS_LOG_NOT_FOUND",
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
}

