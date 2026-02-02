import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";

@Injectable()
export class UnblockActionService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAllUnblockActions() {
        return this.prismaService.unblockAction.findMany();
    }

    async getDefaultUnblockActions() {
        return this.prismaService.unblockAction.findMany({
            where: { isDefault: true },
        });
    }

    async getUserUnblockActions(userId: string) {
        const userUnblockActions = await this.prismaService.userUnblockAction.findMany({
            where: { userId },
            include: { unblockAction: true },
        });
        return userUnblockActions?.map((item) => item.unblockAction) || null;
    }

    async createUnblockAction(name: string) {
        const existingUnblockAction = await this.prismaService.unblockAction.findFirst({
            where: { name },
        });

        if (existingUnblockAction) {
            throw new HttpApiException({
                status: HttpStatus.CONFLICT,
                message: `Unblock action with name '${name}' already exists.`,
                code: "UNBLOCK_ACTION_ALREADY_EXISTS",
            });
        }

        return this.prismaService.unblockAction.create({
            data: { name },
        });
    }

    async createUserUnblockAction(userId: string, actionId: string) {
        const existingUserUnblockAction = await this.prismaService.userUnblockAction.findFirst({
            where: { userId, actionId },
        });

        if (existingUserUnblockAction) {
            throw new HttpApiException({
                status: HttpStatus.CONFLICT,
                message: `User unblock action with actionId '${actionId}' already exists for user '${userId}'.`,
                code: "USER_UNBLOCK_ACTION_ALREADY_EXISTS",
            });
        }

        return this.prismaService.userUnblockAction.create({
            data: { userId, actionId },
        });
    }

    async deleteUserUnblockAction(userId: string, actionId: string) {
        return this.prismaService.userUnblockAction.deleteMany({
            where: { userId, actionId },
        });
    }
}