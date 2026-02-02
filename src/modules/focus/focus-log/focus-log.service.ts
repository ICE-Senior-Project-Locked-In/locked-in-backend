import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";

@Injectable()
export class FocusLogService {
    constructor(private readonly prismaService: PrismaService) { }

    private async ensureOwnership(userId: string, logId: string) {
        const exists = await this.prismaService.focusLog.findFirst({
            where: { logId, userId },
        });
        if (!exists) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: "Focus log not found for the user",
                code: "FOCUS_LOG_NOT_FOUND",
            });
        }
    }

    async getFocusLogsByUserId(userId: string) {
        return this.prismaService.focusLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getActiveFocusLogByUserId(userId: string) {
        return this.prismaService.focusLog.findFirst({
            where: { userId, endTime: null },
            orderBy: { startTime: 'desc' }
        });
    }

    async startFocusLog(userId: string, typeId: string, startTime: Date) {
        return this.prismaService.focusLog.create({
            data: { userId, typeId, startTime }
        });
    }

    async endFocusLog(userId: string, logId: string, endTime: Date) {
        await this.ensureOwnership(userId, logId);

        return this.prismaService.focusLog.update({
            where: { logId },
            data: { endTime }
        });
    }
}