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

    const focusLogMock = {
        findMany: jest.fn(),
    };

    const userMock = {
        findMany: jest.fn(),
    };

    const prismaServiceMock = {
        friendship: friendshipMock,
        focusLog: focusLogMock,
        user: userMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new FriendService(prismaServiceMock);
        focusLogMock.findMany.mockResolvedValue([]);
        userMock.findMany.mockResolvedValue([]);
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

    describe("getLeaderboard", () => {
        const makeUser = (userId: string) => ({
            userId,
            email: `${userId}@test.com`,
            name: userId,
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const makeLog = (userId: string, startTime: Date, endTime: Date) => ({
            logId: `log-${userId}-${startTime.getTime()}`,
            userId,
            modeId: "mode-1",
            startTime,
            endTime,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        it("should return current user and friends ranked by total focus time", async () => {
            const userId = "user-1";
            const friend = makeUser("user-2");
            const self = makeUser(userId);

            friendshipMock.findMany.mockResolvedValue([
                { senderId: userId, receiverId: "user-2" },
            ]);

            const start = new Date("2025-01-01T00:00:00Z");
            focusLogMock.findMany.mockResolvedValue([
                makeLog(userId, start, new Date(start.getTime() + 3600_000)),   // 3600s
                makeLog("user-2", start, new Date(start.getTime() + 7200_000)), // 7200s
            ]);

            userMock.findMany.mockResolvedValue([self, friend]);

            const result = await service.getLeaderboard(userId, {});

            expect(result[0]).toMatchObject({ rank: 1, totalFocusTime: 7200, user: friend });
            expect(result[1]).toMatchObject({ rank: 2, totalFocusTime: 3600, user: self });
        });

        it("should give totalFocusTime of 0 for users with no completed logs", async () => {
            const userId = "user-1";
            const self = makeUser(userId);
            const friend = makeUser("user-2");

            friendshipMock.findMany.mockResolvedValue([
                { senderId: userId, receiverId: "user-2" },
            ]);
            focusLogMock.findMany.mockResolvedValue([
                makeLog(userId, new Date("2025-01-01T00:00:00Z"), new Date("2025-01-01T01:00:00Z")),
            ]);
            userMock.findMany.mockResolvedValue([self, friend]);

            const result = await service.getLeaderboard(userId, {});

            const friendEntry = result.find(e => e.user.userId === "user-2")!;
            expect(friendEntry.totalFocusTime).toBe(0);
        });

        it("should assign the same dense rank to tied participants", async () => {
            const userId = "user-1";
            const self = makeUser(userId);
            const f2 = makeUser("user-2");
            const f3 = makeUser("user-3");

            friendshipMock.findMany.mockResolvedValue([
                { senderId: userId, receiverId: "user-2" },
                { senderId: userId, receiverId: "user-3" },
            ]);

            const start = new Date("2025-01-01T00:00:00Z");
            const end = new Date(start.getTime() + 3600_000);
            focusLogMock.findMany.mockResolvedValue([
                makeLog(userId, start, end),
                makeLog("user-2", start, end),
                makeLog("user-3", start, end),
            ]);
            userMock.findMany.mockResolvedValue([self, f2, f3]);

            const result = await service.getLeaderboard(userId, {});

            expect(result.every(e => e.rank === 1)).toBe(true);
        });

        it("should filter focus logs by startDate and endDate", async () => {
            const userId = "user-1";
            const self = makeUser(userId);

            friendshipMock.findMany.mockResolvedValue([]);

            const inRange = makeLog(userId, new Date("2025-01-15T00:00:00Z"), new Date("2025-01-15T00:30:00Z")); // 1800s
            focusLogMock.findMany.mockResolvedValue([inRange]);
            userMock.findMany.mockResolvedValue([self]);

            const result = await service.getLeaderboard(userId, {
                startDate: new Date("2025-01-01T00:00:00Z"),
                endDate: new Date("2025-01-31T23:59:59Z"),
            });

            expect(focusLogMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        startTime: expect.objectContaining({
                            gte: new Date("2025-01-01T00:00:00Z"),
                            lte: new Date("2025-01-31T23:59:59Z"),
                        }),
                    }),
                })
            );
            expect(result[0].totalFocusTime).toBe(1800);
        });

        it("should limit to top N and append current user if outside top N", async () => {
            const userId = "user-1";
            const self = makeUser(userId);
            const f2 = makeUser("user-2");
            const f3 = makeUser("user-3");

            friendshipMock.findMany.mockResolvedValue([
                { senderId: userId, receiverId: "user-2" },
                { senderId: userId, receiverId: "user-3" },
            ]);

            const start = new Date("2025-01-01T00:00:00Z");
            focusLogMock.findMany.mockResolvedValue([
                makeLog("user-2", start, new Date(start.getTime() + 7200_000)), // 7200s rank 1
                makeLog("user-3", start, new Date(start.getTime() + 3600_000)), // 3600s rank 2
                // user-1 has 0s → rank 3
            ]);
            userMock.findMany.mockResolvedValue([self, f2, f3]);

            const result = await service.getLeaderboard(userId, { top: 1 });

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({ rank: 1, user: f2 });
            expect(result[1]).toMatchObject({ rank: 3, user: self });
        });

        it("should not duplicate current user when already in top N", async () => {
            const userId = "user-1";
            const self = makeUser(userId);
            const friend = makeUser("user-2");

            friendshipMock.findMany.mockResolvedValue([
                { senderId: userId, receiverId: "user-2" },
            ]);

            const start = new Date("2025-01-01T00:00:00Z");
            focusLogMock.findMany.mockResolvedValue([
                makeLog(userId, start, new Date(start.getTime() + 7200_000)), // 7200s rank 1
                makeLog("user-2", start, new Date(start.getTime() + 3600_000)), // 3600s rank 2
            ]);
            userMock.findMany.mockResolvedValue([self, friend]);

            const result = await service.getLeaderboard(userId, { top: 1 });

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({ rank: 1, user: self });
        });
    });
});
