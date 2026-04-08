import { HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { UserService } from "./user.service";
import type { UpdateUserDto } from "./dto/user.dto";

describe("UserService", () => {
    let service: UserService;

    const userMock = {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
    };

    const prismaServiceMock = {
        user: userMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new UserService(prismaServiceMock);
    });

    describe("getUsers", () => {
        it("should return paginated users without filters", async () => {
            const userId = "user-1";
            const users = [{ userId: "user-2" }, { userId: "user-3" }];
            userMock.findMany.mockResolvedValue(users);
            userMock.count.mockResolvedValue(2);

            const result = await service.getUsers(userId);

            expect(userMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, orderBy: { createdAt: "desc" } })
            );
            expect(userMock.count).toHaveBeenCalledWith({ where: {} });
            expect(result.data).toBe(users);
            expect(result.pagination).toBeDefined();
        });

        it("should filter users by name (case-insensitive)", async () => {
            const userId = "user-1";
            userMock.findMany.mockResolvedValue([]);
            userMock.count.mockResolvedValue(0);

            await service.getUsers(userId, { name: "alice" });

            expect(userMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { name: { contains: "alice", mode: "insensitive" } },
                })
            );
            expect(userMock.count).toHaveBeenCalledWith({
                where: { name: { contains: "alice", mode: "insensitive" } },
            });
        });

        it("should exclude current user when excludeCurrentUser is true", async () => {
            const userId = "user-1";
            userMock.findMany.mockResolvedValue([]);
            userMock.count.mockResolvedValue(0);

            await service.getUsers(userId, { excludeCurrentUser: true });

            expect(userMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: { not: userId } },
                })
            );
        });

        it("should apply both name filter and excludeCurrentUser together", async () => {
            const userId = "user-1";
            userMock.findMany.mockResolvedValue([]);
            userMock.count.mockResolvedValue(0);

            await service.getUsers(userId, { name: "bob", excludeCurrentUser: true });

            expect(userMock.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        name: { contains: "bob", mode: "insensitive" },
                        userId: { not: userId },
                    },
                })
            );
        });

        it("should include pagination metadata in the response", async () => {
            const userId = "user-1";
            userMock.findMany.mockResolvedValue([{ userId: "user-2" }]);
            userMock.count.mockResolvedValue(1);

            const result = await service.getUsers(userId, {}, { page: 1, itemsPerPage: 10 });

            expect(result.pagination).toMatchObject({
                total: 1,
            });
        });
    });

    describe("getUserById", () => {
        it("should return the user when found", async () => {
            const userId = "user-1";
            const user = { userId, email: "test@example.com" };
            userMock.findUnique.mockResolvedValue(user);

            const result = await service.getUserById(userId);

            expect(userMock.findUnique).toHaveBeenCalledWith({ where: { userId } });
            expect(result).toBe(user);
        });

        it("should return null when user is not found", async () => {
            userMock.findUnique.mockResolvedValue(null);

            const result = await service.getUserById("user-missing");

            expect(result).toBeNull();
        });
    });

    describe("updateUser", () => {
        it("should update and return the user when user exists", async () => {
            const userId = "user-1";
            const data: UpdateUserDto = { name: "Alice Updated" } as UpdateUserDto;
            const updated = { userId, email: "test@example.com", name: "Alice Updated" };

            userMock.findUnique.mockResolvedValue({ userId });
            userMock.update.mockResolvedValue(updated);

            const result = await service.updateUser(userId, data);

            expect(userMock.findUnique).toHaveBeenCalledWith({ where: { userId } });
            expect(userMock.update).toHaveBeenCalledWith({
                where: { userId },
                data,
            });
            expect(result).toBe(updated);
        });

        it("should throw NOT_FOUND when user does not exist", async () => {
            const userId = "user-missing";
            userMock.findUnique.mockResolvedValue(null);

            try {
                await service.updateUser(userId, { name: "Alice" } as UpdateUserDto);
                fail("Expected updateUser to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("USER_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `User not found with ID '${userId}'.`,
                    code: "USER_NOT_FOUND",
                    details: null,
                });
            }

            expect(userMock.update).not.toHaveBeenCalled();
        });
    });
});
