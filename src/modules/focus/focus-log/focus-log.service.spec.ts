import { HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { FocusLogService } from "./focus-log.service";

describe("FocusLogService", () => {
    let service: FocusLogService;

    const focusLogMock = {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    };

    const prismaServiceMock = {
        focusLog: focusLogMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new FocusLogService(prismaServiceMock);
    });

    it("should get focus logs by user id in descending createdAt order", async () => {
        const userId = "user-1";
        const logs = [{ logId: "log-1" }, { logId: "log-2" }];
        focusLogMock.findMany.mockResolvedValue(logs);

        const result = await service.getFocusLogsByUserId(userId);

        expect(focusLogMock.findMany).toHaveBeenCalledWith({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        expect(result).toBe(logs);
    });

    it("should get the active focus log by user id", async () => {
        const userId = "user-1";
        const activeLog = { logId: "log-active", endTime: null };
        focusLogMock.findFirst.mockResolvedValue(activeLog);

        const result = await service.getActiveFocusLogByUserId(userId);

        expect(focusLogMock.findFirst).toHaveBeenCalledWith({
            where: { userId, endTime: null },
            orderBy: { startTime: "desc" },
        });
        expect(result).toBe(activeLog);
    });

    it("should start a focus log", async () => {
        const userId = "user-1";
        const modeId = "mode-1";
        const startTime = new Date("2026-01-01T00:00:00.000Z");
        const createdLog = { logId: "log-1", userId, modeId, startTime };
        focusLogMock.create.mockResolvedValue(createdLog);

        const result = await service.startFocusLog(userId, modeId, startTime);

        expect(focusLogMock.create).toHaveBeenCalledWith({
            data: { userId, modeId, startTime },
        });
        expect(result).toBe(createdLog);
    });

    it("should end a focus log when it belongs to the user", async () => {
        const userId = "user-1";
        const logId = "log-1";
        const endTime = new Date("2026-01-01T01:00:00.000Z");
        const updatedLog = { logId, userId, endTime };

        focusLogMock.findFirst.mockResolvedValue({ logId, userId });
        focusLogMock.update.mockResolvedValue(updatedLog);

        const result = await service.endFocusLog(userId, logId, endTime);

        expect(focusLogMock.findFirst).toHaveBeenCalledWith({
            where: { logId, userId },
        });
        expect(focusLogMock.update).toHaveBeenCalledWith({
            where: { logId },
            data: { endTime },
        });
        expect(result).toBe(updatedLog);
    });

    it("should throw not found when ending a focus log not owned by the user", async () => {
        const userId = "user-1";
        const logId = "missing-log";
        const endTime = new Date("2026-01-01T01:00:00.000Z");

        focusLogMock.findFirst.mockResolvedValue(null);

        try {
            await service.endFocusLog(userId, logId, endTime);
            fail("Expected endFocusLog to throw HttpApiException");
        } catch (error) {
            expect(error).toBeInstanceOf(HttpApiException);

            if (error instanceof HttpApiException) {
                expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect(error.code).toBe("FOCUS_LOG_NOT_FOUND");
                expect(error.getResponse()).toEqual({
                    message: "Focus log not found for the user",
                    code: "FOCUS_LOG_NOT_FOUND",
                    details: null,
                });
            }
        }

        expect(focusLogMock.update).not.toHaveBeenCalled();
    });
});
