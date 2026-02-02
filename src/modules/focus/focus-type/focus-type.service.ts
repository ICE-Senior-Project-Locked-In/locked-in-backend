import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";

@Injectable()
export class FocusTypeService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAllFocusTypes() {
        return this.prismaService.focusType.findMany();
    }

    async getDefaultFocusTypes() {
        return this.prismaService.focusType.findMany({
            where: { isDefault: true }
        });
    }

    async getUserFocusTypes(userId: string) {
        const userFocusType = await this.prismaService.userFocusType.findMany({
            where: { userId },
            include: { focusType: true }
        })
        return userFocusType?.map(item => item.focusType) || null;
    }

    async createFocusType(name: string) {
        const existingFocusType = await this.prismaService.focusType.findFirst({
            where: { name }
        });

        if (existingFocusType) {
            throw new HttpApiException({
                status: HttpStatus.CONFLICT,
                message: `Focus type with name '${name}' already exists.`,
                code: "FOCUS_TYPE_ALREADY_EXISTS"
            });
        }

        return this.prismaService.focusType.create({
            data: { name }
        });
    }

    async createUserFocusType(userId: string, typeId: string) {
        const existingUserFocusType = await this.prismaService.userFocusType.findFirst({
            where: { userId, typeId }
        });

        if (existingUserFocusType) {
            throw new HttpApiException({
                status: HttpStatus.CONFLICT,
                message: `User focus type with typeId '${typeId}' already exists for user '${userId}'.`,
                code: "USER_FOCUS_TYPE_ALREADY_EXISTS"
            });
        }

        return this.prismaService.userFocusType.create({
            data: { userId, typeId }
        });
    }

    async deleteUserFocusType(userId: string, typeId: string) {
        return this.prismaService.userFocusType.deleteMany({
            where: { userId, typeId }
        });
    }
}