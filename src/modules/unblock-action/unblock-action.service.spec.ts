import { HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { UnblockActionService } from "./unblock-action.service";

describe("UnblockActionService", () => {
    let service: UnblockActionService;

    const unblockActionMock = {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    };

    const userUnblockActionMock = {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
    };

    const prismaServiceMock = {
        unblockAction: unblockActionMock,
        userUnblockAction: userUnblockActionMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new UnblockActionService(prismaServiceMock);
    });

    it("should get all unblock actions", async () => {
        const actions = [{ actionId: "a1" }, { actionId: "a2" }];
        unblockActionMock.findMany.mockResolvedValue(actions);

        const result = await service.getAllUnblockActions();

        expect(unblockActionMock.findMany).toHaveBeenCalledWith();
        expect(result).toBe(actions);
    });

    it("should get default unblock actions", async () => {
        const defaultActions = [{ actionId: "a1", isDefault: true }];
        unblockActionMock.findMany.mockResolvedValue(defaultActions);

        const result = await service.getDefaultUnblockActions();

        expect(unblockActionMock.findMany).toHaveBeenCalledWith({
            where: { isDefault: true },
        });
        expect(result).toBe(defaultActions);
    });

    it("should get user unblock actions mapped to unblockAction", async () => {
        const userId = "user-1";
        const data = [
            { unblockAction: { actionId: "a1", name: "Walk" } },
            { unblockAction: { actionId: "a2", name: "Water" } },
        ];
        userUnblockActionMock.findMany.mockResolvedValue(data);

        const result = await service.getUserUnblockActions(userId);

        expect(userUnblockActionMock.findMany).toHaveBeenCalledWith({
            where: { userId },
            include: { unblockAction: true },
        });
        expect(result).toEqual([
            { actionId: "a1", name: "Walk" },
            { actionId: "a2", name: "Water" },
        ]);
    });

    it("should return null when user unblock action query returns null", async () => {
        const userId = "user-1";
        userUnblockActionMock.findMany.mockResolvedValue(null);

        const result = await service.getUserUnblockActions(userId);

        expect(result).toBeNull();
    });

    it("should create unblock action when name does not exist", async () => {
        const name = "Stretch";
        const createdAction = { actionId: "a1", name };

        unblockActionMock.findFirst.mockResolvedValue(null);
        unblockActionMock.create.mockResolvedValue(createdAction);

        const result = await service.createUnblockAction(name);

        expect(unblockActionMock.findFirst).toHaveBeenCalledWith({
            where: { name },
        });
        expect(unblockActionMock.create).toHaveBeenCalledWith({
            data: { name },
        });
        expect(result).toBe(createdAction);
    });

    it("should throw conflict when creating duplicate unblock action name", async () => {
        const name = "Stretch";
        unblockActionMock.findFirst.mockResolvedValue({ actionId: "a1", name });

        try {
            await service.createUnblockAction(name);
            fail("Expected createUnblockAction to throw HttpApiException");
        } catch (error) {
            expect(error).toBeInstanceOf(HttpApiException);
            expect((error as HttpApiException).getStatus()).toBe(HttpStatus.CONFLICT);
            expect((error as HttpApiException).code).toBe("UNBLOCK_ACTION_ALREADY_EXISTS");
            expect((error as HttpApiException).getResponse()).toEqual({
                message: `Unblock action with name '${name}' already exists.`,
                code: "UNBLOCK_ACTION_ALREADY_EXISTS",
                details: null,
            });
        }

        expect(unblockActionMock.create).not.toHaveBeenCalled();
    });

    it("should create user unblock action when pair does not exist", async () => {
        const userId = "user-1";
        const actionId = "action-1";
        const createdUserAction = { userId, actionId };

        userUnblockActionMock.findFirst.mockResolvedValue(null);
        userUnblockActionMock.create.mockResolvedValue(createdUserAction);

        const result = await service.createUserUnblockAction(userId, actionId);

        expect(userUnblockActionMock.findFirst).toHaveBeenCalledWith({
            where: { userId, actionId },
        });
        expect(userUnblockActionMock.create).toHaveBeenCalledWith({
            data: { userId, actionId },
        });
        expect(result).toBe(createdUserAction);
    });

    it("should throw conflict when creating duplicate user unblock action", async () => {
        const userId = "user-1";
        const actionId = "action-1";

        userUnblockActionMock.findFirst.mockResolvedValue({ userId, actionId });

        try {
            await service.createUserUnblockAction(userId, actionId);
            fail("Expected createUserUnblockAction to throw HttpApiException");
        } catch (error) {
            expect(error).toBeInstanceOf(HttpApiException);
            expect((error as HttpApiException).getStatus()).toBe(HttpStatus.CONFLICT);
            expect((error as HttpApiException).code).toBe("USER_UNBLOCK_ACTION_ALREADY_EXISTS");
            expect((error as HttpApiException).getResponse()).toEqual({
                message: `User unblock action with actionId '${actionId}' already exists for user '${userId}'.`,
                code: "USER_UNBLOCK_ACTION_ALREADY_EXISTS",
                details: null,
            });
        }

        expect(userUnblockActionMock.create).not.toHaveBeenCalled();
    });

    it("should delete user unblock action by user id and action id", async () => {
        const userId = "user-1";
        const actionId = "action-1";
        const deletedCount = { count: 1 };

        userUnblockActionMock.deleteMany.mockResolvedValue(deletedCount);

        const result = await service.deleteUserUnblockAction(userId, actionId);

        expect(userUnblockActionMock.deleteMany).toHaveBeenCalledWith({
            where: { userId, actionId },
        });
        expect(result).toBe(deletedCount);
    });
});
