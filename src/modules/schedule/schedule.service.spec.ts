import { HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { ScheduleService } from "./schedule.service";
import type { CreateScheduleDto, UpdateScheduleDto } from "./dto/schedule.dto";

describe("ScheduleService", () => {
    let service: ScheduleService;

    const focusScheduleMock = {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const prismaServiceMock = {
        focusSchedule: focusScheduleMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ScheduleService(prismaServiceMock);
    });

    describe("listByUserId", () => {
        it("should return schedules with daysOfWeek mapped from days relation", async () => {
            const userId = "user-1";
            const rawSchedules = [
                {
                    scheduleId: "s1",
                    userId,
                    title: "Morning Focus",
                    days: [{ dayOfWeek: 1 }, { dayOfWeek: 3 }, { dayOfWeek: 5 }],
                },
                {
                    scheduleId: "s2",
                    userId,
                    title: "Evening Review",
                    days: [{ dayOfWeek: 0 }, { dayOfWeek: 6 }],
                },
            ];
            focusScheduleMock.findMany.mockResolvedValue(rawSchedules);

            const result = await service.listByUserId(userId);

            expect(focusScheduleMock.findMany).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    days: {
                        select: { dayOfWeek: true },
                    },
                },
            });
            expect(result).toEqual([
                { ...rawSchedules[0], daysOfWeek: [1, 3, 5] },
                { ...rawSchedules[1], daysOfWeek: [0, 6] },
            ]);
        });

        it("should return empty array when user has no schedules", async () => {
            focusScheduleMock.findMany.mockResolvedValue([]);

            const result = await service.listByUserId("user-1");

            expect(result).toEqual([]);
        });
    });

    describe("create", () => {
        it("should create a schedule with days and convert HH:MM:SS to epoch-anchored Date", async () => {
            const userId = "user-1";
            const data: CreateScheduleDto = {
                modeId: "mode-1",
                title: "Morning Focus",
                startTime: "09:00:00",
                endTime: "10:30:00",
                daysOfWeek: [1, 3, 5],
            } as CreateScheduleDto;

            const created = { scheduleId: "s1", userId, ...data };
            focusScheduleMock.create.mockResolvedValue(created);

            const result = await service.create(userId, data);

            const { daysOfWeek, startTime, endTime, ...scheduleData } = data;
            expect(focusScheduleMock.create).toHaveBeenCalledWith({
                data: {
                    ...scheduleData,
                    startTime: new Date("1970-01-01T09:00:00.000Z"),
                    endTime: new Date("1970-01-01T10:30:00.000Z"),
                    userId,
                    days: {
                        create: daysOfWeek.map((dayOfWeek) => ({ dayOfWeek })),
                    },
                },
            });
            expect(result).toBe(created);
        });
    });

    describe("update", () => {
        it("should update schedule fields and replace days when schedule exists", async () => {
            const userId = "user-1";
            const scheduleId = "s1";
            const data: UpdateScheduleDto = {
                title: "Updated Focus",
                daysOfWeek: [2, 4],
            } as UpdateScheduleDto;
            const updated = { scheduleId, title: "Updated Focus", daysOfWeek: [2, 4] };

            focusScheduleMock.findUnique.mockResolvedValue({ scheduleId, userId });
            focusScheduleMock.update.mockResolvedValue(updated);

            const result = await service.update(userId, scheduleId, data);

            expect(focusScheduleMock.findUnique).toHaveBeenCalledWith({
                where: { scheduleId, userId },
            });
            const { daysOfWeek, ...scheduleData } = data;
            expect(focusScheduleMock.update).toHaveBeenCalledWith({
                where: { scheduleId, userId },
                data: {
                    ...scheduleData,
                    days: {
                        deleteMany: {},
                        create: daysOfWeek!.map((dayOfWeek) => ({ dayOfWeek })),
                    },
                },
            });
            expect(result).toBe(updated);
        });

        it("should update schedule without replacing days when daysOfWeek is not provided", async () => {
            const userId = "user-1";
            const scheduleId = "s1";
            const data: UpdateScheduleDto = { title: "Updated Focus" } as UpdateScheduleDto;

            focusScheduleMock.findUnique.mockResolvedValue({ scheduleId, userId });
            focusScheduleMock.update.mockResolvedValue({ scheduleId, ...data });

            await service.update(userId, scheduleId, data);

            expect(focusScheduleMock.update).toHaveBeenCalledWith({
                where: { scheduleId, userId },
                data,
            });
        });

        it("should convert startTime/endTime to epoch-anchored Date when provided", async () => {
            const userId = "user-1";
            const scheduleId = "s1";
            const data: UpdateScheduleDto = {
                startTime: "07:15:00",
                endTime: "08:45:00",
            } as UpdateScheduleDto;

            focusScheduleMock.findUnique.mockResolvedValue({ scheduleId, userId });
            focusScheduleMock.update.mockResolvedValue({ scheduleId });

            await service.update(userId, scheduleId, data);

            expect(focusScheduleMock.update).toHaveBeenCalledWith({
                where: { scheduleId, userId },
                data: {
                    startTime: new Date("1970-01-01T07:15:00.000Z"),
                    endTime: new Date("1970-01-01T08:45:00.000Z"),
                },
            });
        });

        it("should throw NOT_FOUND when schedule does not belong to user", async () => {
            const userId = "user-1";
            const scheduleId = "s-missing";
            focusScheduleMock.findUnique.mockResolvedValue(null);

            try {
                await service.update(userId, scheduleId, {} as UpdateScheduleDto);
                fail("Expected update to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("SCHEDULE_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Schedule not found with ID '${scheduleId}'.`,
                    code: "SCHEDULE_NOT_FOUND",
                    details: null,
                });
            }

            expect(focusScheduleMock.update).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("should delete schedule when it belongs to user", async () => {
            const userId = "user-1";
            const scheduleId = "s1";
            const deleted = { scheduleId, userId };

            focusScheduleMock.findUnique.mockResolvedValue({ scheduleId, userId });
            focusScheduleMock.delete.mockResolvedValue(deleted);

            const result = await service.delete(userId, scheduleId);

            expect(focusScheduleMock.findUnique).toHaveBeenCalledWith({
                where: { scheduleId, userId },
            });
            expect(focusScheduleMock.delete).toHaveBeenCalledWith({
                where: { scheduleId, userId },
            });
            expect(result).toBe(deleted);
        });

        it("should throw NOT_FOUND when schedule does not exist or does not belong to user", async () => {
            const userId = "user-1";
            const scheduleId = "s-missing";
            focusScheduleMock.findUnique.mockResolvedValue(null);

            try {
                await service.delete(userId, scheduleId);
                fail("Expected delete to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("SCHEDULE_NOT_FOUND");
            }

            expect(focusScheduleMock.delete).not.toHaveBeenCalled();
        });
    });
});
