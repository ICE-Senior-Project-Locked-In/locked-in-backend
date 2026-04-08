import { HttpStatus } from "@nestjs/common";
import { FriendshipStatus } from "@prisma/client";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { FriendService } from "./friend.service";

describe("FriendService", () => {
    let service: FriendService;

    const friendshipMock = {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const prismaServiceMock = {
        friendship: friendshipMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new FriendService(prismaServiceMock);
    });

    describe("getFriends", () => {
        it("should return accepted friends with the other user mapped correctly", async () => {
            const userId = "user-1";
            const friend1 = { userId: "user-2", email: "a@test.com" };
            const friend2 = { userId: "user-3", email: "b@test.com" };

            const friendships = [
                { friendshipId: "f1", senderId: userId, receiverId: "user-2", sender: { userId }, receiver: friend1 },
                { friendshipId: "f2", senderId: "user-3", receiverId: userId, sender: friend2, receiver: { userId } },
            ];

            friendshipMock.findMany.mockResolvedValue(friendships);
            friendshipMock.count.mockResolvedValue(2);

            const result = await service.getFriends(userId);

            const expectedWhere = {
                status: FriendshipStatus.ACCEPTED,
                OR: [{ senderId: userId }, { receiverId: userId }],
            };
            expect(friendshipMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expectedWhere,
                    include: { sender: true, receiver: true },
                })
            );
            expect(friendshipMock.count).toHaveBeenCalledWith({ where: expectedWhere });
            // sender gets receiver, receiver gets sender
            expect(result.data).toEqual([friend1, friend2]);
        });

        it("should return empty data when user has no accepted friends", async () => {
            friendshipMock.findMany.mockResolvedValue([]);
            friendshipMock.count.mockResolvedValue(0);

            const result = await service.getFriends("user-1");

            expect(result.data).toEqual([]);
            expect(result.pagination).toBeDefined();
        });

        it("should include pagination metadata", async () => {
            friendshipMock.findMany.mockResolvedValue([]);
            friendshipMock.count.mockResolvedValue(5);

            const result = await service.getFriends("user-1", { page: 1, itemsPerPage: 10 });

            expect(result.pagination).toMatchObject({ total: 5 });
        });
    });

    describe("createFriendRequest", () => {
        it("should create a pending friend request", async () => {
            const senderId = "user-1";
            const receiverId = "user-2";
            const friendship = { friendshipId: "f1", senderId, receiverId, status: FriendshipStatus.PENDING };

            friendshipMock.create.mockResolvedValue(friendship);

            const result = await service.createFriendRequest(senderId, receiverId);

            expect(friendshipMock.create).toHaveBeenCalledWith({
                data: { senderId, receiverId, status: FriendshipStatus.PENDING },
            });
            expect(result).toBe(friendship);
        });
    });

    describe("updateFriendRequest", () => {
        it("should update status when user is the sender", async () => {
            const userId = "user-1";
            const friendshipId = "f1";
            const updated = { friendshipId, status: FriendshipStatus.ACCEPTED };

            friendshipMock.findFirst.mockResolvedValue({ friendshipId, senderId: userId });
            friendshipMock.update.mockResolvedValue(updated);

            const result = await service.updateFriendRequest(userId, friendshipId, FriendshipStatus.ACCEPTED);

            expect(friendshipMock.findFirst).toHaveBeenCalledWith({
                where: {
                    friendshipId,
                    OR: [{ senderId: userId }, { receiverId: userId }],
                },
            });
            expect(friendshipMock.update).toHaveBeenCalledWith({
                where: { friendshipId },
                data: { status: FriendshipStatus.ACCEPTED },
            });
            expect(result).toBe(updated);
        });

        it("should update status when user is the receiver", async () => {
            const userId = "user-2";
            const friendshipId = "f1";

            friendshipMock.findFirst.mockResolvedValue({ friendshipId, receiverId: userId });
            friendshipMock.update.mockResolvedValue({ friendshipId, status: FriendshipStatus.REJECTED });

            await service.updateFriendRequest(userId, friendshipId, FriendshipStatus.REJECTED);

            expect(friendshipMock.update).toHaveBeenCalled();
        });

        it("should throw NOT_FOUND when user is not part of the friendship", async () => {
            const userId = "user-99";
            const friendshipId = "f1";
            friendshipMock.findFirst.mockResolvedValue(null);

            try {
                await service.updateFriendRequest(userId, friendshipId, FriendshipStatus.ACCEPTED);
                fail("Expected updateFriendRequest to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("FOCUS_LOG_NOT_FOUND");
            }

            expect(friendshipMock.update).not.toHaveBeenCalled();
        });
    });

    describe("deleteFriendship", () => {
        it("should delete friendship when user is part of it", async () => {
            const userId = "user-1";
            const friendshipId = "f1";

            friendshipMock.findFirst.mockResolvedValue({ friendshipId, senderId: userId });
            friendshipMock.delete.mockResolvedValue({ friendshipId });

            await service.deleteFriendship(userId, friendshipId);

            expect(friendshipMock.findFirst).toHaveBeenCalledWith({
                where: {
                    friendshipId,
                    OR: [{ senderId: userId }, { receiverId: userId }],
                },
            });
            expect(friendshipMock.delete).toHaveBeenCalledWith({
                where: { friendshipId },
            });
        });

        it("should throw NOT_FOUND when user is not part of the friendship", async () => {
            const userId = "user-99";
            const friendshipId = "f1";
            friendshipMock.findFirst.mockResolvedValue(null);

            try {
                await service.deleteFriendship(userId, friendshipId);
                fail("Expected deleteFriendship to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("FOCUS_LOG_NOT_FOUND");
            }

            expect(friendshipMock.delete).not.toHaveBeenCalled();
        });
    });
});
