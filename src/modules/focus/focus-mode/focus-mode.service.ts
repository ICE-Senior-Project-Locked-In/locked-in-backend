import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import type { CreateFocusModeDto, UpdateFocusModeDto } from "./dto/focus-mode.dto";

@Injectable()
export class FocusModeService {
    constructor(private readonly prismaService: PrismaService) { }

    async getFocusModes(userId: string) {
        return this.prismaService.focusMode.findMany({
            where: { userId },
        });
    }

    async createFocusMode(userId: string, data: CreateFocusModeDto) {
        const { title, blackListedApps, userUnblockActionId } = data;
        return this.prismaService.focusMode.create({
            data: { userId, title, blackListedApps: blackListedApps ?? [], userUnblockActionId },
        });
    }

    async updateFocusMode(userId: string, modeId: string, data: UpdateFocusModeDto) {
        const existing = await this.prismaService.focusMode.findFirst({
            where: { modeId, userId },
        });

        if (!existing) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `Focus mode with ID '${modeId}' not found.`,
                code: "FOCUS_MODE_NOT_FOUND",
            });
        }

        return this.prismaService.focusMode.update({
            where: { modeId },
            data,
        });
    }

    async deleteFocusMode(userId: string, modeId: string) {
        const existing = await this.prismaService.focusMode.findFirst({
            where: { modeId, userId },
        });

        if (!existing) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `Focus mode with ID '${modeId}' not found.`,
                code: "FOCUS_MODE_NOT_FOUND",
            });
        }

        return this.prismaService.focusMode.delete({
            where: { modeId },
        });
    }
}
