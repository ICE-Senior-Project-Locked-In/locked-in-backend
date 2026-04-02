import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import type { CreateScheduleDto, UpdateScheduleDto } from "./dto/schedule.dto";

@Injectable()
export class ScheduleService {
    constructor(private readonly prismaService: PrismaService) { }

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
        return this.prismaService.focusSchedule.findMany({
            where: { userId },
        });
    }

    async create(userId: string, data: CreateScheduleDto) {
        const { daysOfWeek, ...scheduleData } = data;

        return this.prismaService.focusSchedule.create({
            data: {
                ...scheduleData,
                userId,
                days: {
                    create: daysOfWeek.map((dayOfWeek) => ({ dayOfWeek })),
                },
            },
        });
    }

    async update(userId: string, scheduleId: string, data: UpdateScheduleDto) {
        await this.ensureScheduleExists(scheduleId, userId);

        const { daysOfWeek, ...scheduleData } = data;

        return this.prismaService.focusSchedule.update({
            where: { scheduleId, userId },
            data: {
                ...scheduleData,
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