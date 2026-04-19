import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import type { CreateScheduleDto, UpdateScheduleDto } from "./dto/schedule.dto";

@Injectable()
export class ScheduleService {
    constructor(private readonly prismaService: PrismaService) { }

    /// Prisma's `@db.Time` columns are typed as `DateTime` in the generated
    /// client, so it rejects bare `HH:MM:SS` strings. Anchor to the Unix epoch
    /// — the DB persists only the time component, so the date drops out.
    private toTimeDate(time: string): Date {
        return new Date(`1970-01-01T${time}.000Z`);
    }

    private async ensureScheduleExists(scheduleId: string, userId: string) {
        const existingSchedule = await this.prismaService.focusSchedule.findUnique({
            where: { scheduleId, userId },
        });

        if (!existingSchedule) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `Schedule not found with ID '${scheduleId}'.`,
                code: "SCHEDULE_NOT_FOUND",
            });
        }
    }

    async listByUserId(userId: string) {
        const schedules = await this.prismaService.focusSchedule.findMany({
            where: { userId },
            include: {
                days: {
                    select: {
                        dayOfWeek: true,
                    },
                },
            }
        });

        return schedules.map((schedule) => ({
            ...schedule,
            daysOfWeek: schedule.days.map((day) => day.dayOfWeek),
        }));
    }

    async create(userId: string, data: CreateScheduleDto) {
        const { daysOfWeek, startTime, endTime, ...scheduleData } = data;

        return this.prismaService.focusSchedule.create({
            data: {
                ...scheduleData,
                startTime: this.toTimeDate(startTime),
                endTime: this.toTimeDate(endTime),
                userId,
                days: {
                    create: daysOfWeek.map((dayOfWeek) => ({ dayOfWeek })),
                },
            },
        });
    }

    async update(userId: string, scheduleId: string, data: UpdateScheduleDto) {
        await this.ensureScheduleExists(scheduleId, userId);

        const { daysOfWeek, startTime, endTime, ...scheduleData } = data;

        return this.prismaService.focusSchedule.update({
            where: { scheduleId, userId },
            data: {
                ...scheduleData,
                ...(startTime !== undefined
                    ? { startTime: this.toTimeDate(startTime) }
                    : {}),
                ...(endTime !== undefined
                    ? { endTime: this.toTimeDate(endTime) }
                    : {}),
                ...(daysOfWeek
                    ? {
                        days: {
                            deleteMany: {},
                            create: daysOfWeek.map((dayOfWeek) => ({ dayOfWeek })),
                        },
                    }
                    : {}),
            },
        });
    }

    async delete(userId: string, scheduleId: string) {
        await this.ensureScheduleExists(scheduleId, userId);

        return this.prismaService.focusSchedule.delete({
            where: { scheduleId, userId },
        });
    }
}