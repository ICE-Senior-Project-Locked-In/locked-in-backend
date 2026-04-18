import { HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { FocusModeService } from "./focus-mode.service";
import type { CreateFocusModeDto, UpdateFocusModeDto } from "./dto/focus-mode.dto";

describe("FocusModeService", () => {
    let service: FocusModeService;

    const focusModeMock = {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const prismaServiceMock = {
        focusMode: focusModeMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new FocusModeService(prismaServiceMock);
    });

    describe("getFocusModes", () => {
        it("TC-FMODE-01 — should return all focus modes for a user", async () => {
            const userId = "user-1";
            const modes = [
                { modeId: "m1", userId, title: "Study", blackListedApps: [], userUnblockActionId: null },
                { modeId: "m2", userId, title: "Work", blackListedApps: ["instagram"], userUnblockActionId: null },
            ];
            focusModeMock.findMany.mockResolvedValue(modes);

            const result = await service.getFocusModes(userId);

            expect(focusModeMock.findMany).toHaveBeenCalledWith({ where: { userId } });
            expect(result).toBe(modes);
        });

        it("TC-FMODE-02 — should return empty array when user has no focus modes", async () => {
            focusModeMock.findMany.mockResolvedValue([]);

            const result = await service.getFocusModes("user-1");

            expect(result).toEqual([]);
        });
    });

    describe("createFocusMode", () => {
        it("TC-FMODE-03 — should create a focus mode with provided fields", async () => {
            const userId = "user-1";
            const data = {
                title: "Deep Focus",
                blackListedApps: ["twitter", "instagram"],
                userUnblockActionId: undefined,
            } as CreateFocusModeDto;
            const created = { modeId: "m1", userId, title: "Deep Focus", blackListedApps: ["twitter", "instagram"], userUnblockActionId: null };

            focusModeMock.create.mockResolvedValue(created);

            const result = await service.createFocusMode(userId, data);

            expect(focusModeMock.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    title: "Deep Focus",
                    blackListedApps: ["twitter", "instagram"],
                    userUnblockActionId: undefined,
                },
            });
            expect(result).toBe(created);
        });

        it("TC-FMODE-04 — should default blackListedApps to empty array when not provided", async () => {
            const userId = "user-1";
            const data = { title: "Light Focus" } as CreateFocusModeDto;
            const created = { modeId: "m1", userId, title: "Light Focus", blackListedApps: [], userUnblockActionId: null };

            focusModeMock.create.mockResolvedValue(created);

            await service.createFocusMode(userId, data);

            expect(focusModeMock.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    title: "Light Focus",
                    blackListedApps: [],
                    userUnblockActionId: undefined,
                },
            });
        });
    });

    describe("updateFocusMode", () => {
        it("TC-FMODE-05 — should update focus mode when it belongs to user", async () => {
            const userId = "user-1";
            const modeId = "m1";
            const data = { title: "Updated Study" } as UpdateFocusModeDto;
            const updated = { modeId, userId, title: "Updated Study" };

            focusModeMock.findFirst.mockResolvedValue({ modeId, userId });
            focusModeMock.update.mockResolvedValue(updated);

            const result = await service.updateFocusMode(userId, modeId, data);

            expect(focusModeMock.findFirst).toHaveBeenCalledWith({ where: { modeId, userId } });
            expect(focusModeMock.update).toHaveBeenCalledWith({ where: { modeId }, data });
            expect(result).toBe(updated);
        });

        it("TC-FMODE-06 — should throw NOT_FOUND when focus mode does not exist or belong to user", async () => {
            const modeId = "m-missing";
            focusModeMock.findFirst.mockResolvedValue(null);

            try {
                await service.updateFocusMode("user-1", modeId, {} as UpdateFocusModeDto);
                fail("Expected updateFocusMode to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("FOCUS_MODE_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Focus mode with ID '${modeId}' not found.`,
                    code: "FOCUS_MODE_NOT_FOUND",
                    details: null,
                });
            }

            expect(focusModeMock.update).not.toHaveBeenCalled();
        });
    });

    describe("deleteFocusMode", () => {
        it("TC-FMODE-07 — should delete focus mode when it belongs to user", async () => {
            const userId = "user-1";
            const modeId = "m1";
            const deleted = { modeId, userId };

            focusModeMock.findFirst.mockResolvedValue({ modeId, userId });
            focusModeMock.delete.mockResolvedValue(deleted);

            const result = await service.deleteFocusMode(userId, modeId);

            expect(focusModeMock.findFirst).toHaveBeenCalledWith({ where: { modeId, userId } });
            expect(focusModeMock.delete).toHaveBeenCalledWith({ where: { modeId } });
            expect(result).toBe(deleted);
        });

        it("TC-FMODE-08 — should throw NOT_FOUND when focus mode does not exist or belong to user", async () => {
            const modeId = "m-missing";
            focusModeMock.findFirst.mockResolvedValue(null);

            try {
                await service.deleteFocusMode("user-1", modeId);
                fail("Expected deleteFocusMode to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("FOCUS_MODE_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Focus mode with ID '${modeId}' not found.`,
                    code: "FOCUS_MODE_NOT_FOUND",
                    details: null,
                });
            }

            expect(focusModeMock.delete).not.toHaveBeenCalled();
        });
    });
});
