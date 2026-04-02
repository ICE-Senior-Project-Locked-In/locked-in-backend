import { Injectable, HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { PaginationHelper, PaginationOptions, PaginatedResponse } from "@/common/helper/pagination.helper";
import { Prisma, User } from "@prisma/client";
import type { UpdateUserDto } from "./dto/user.dto";

export type UserFilters = {
    name?: string;
    excludeCurrentUser?: boolean;
}

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) { }

    private async ensureUserExists(userId: string) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { userId },
        });

        if (!existingUser) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `User not found with ID '${userId}'.`,
                code: "USER_NOT_FOUND",
            });
        }
    }

    async getUsers(userId: string, filters?: UserFilters, paginationOptions?: PaginationOptions): Promise<PaginatedResponse<User>> {
        const { name, excludeCurrentUser } = filters || {};

        const where: Prisma.UserWhereInput = {
            ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
            ...(excludeCurrentUser ? { userId: { not: userId } } : {}),
        };

        const offset = PaginationHelper.getOffset(paginationOptions);

        const [data, total] = await Promise.all([
            this.prismaService.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                ...offset
            }),
            this.prismaService.user.count({ where }),
        ]);

        return {
            data,
            pagination: PaginationHelper.getMetaData(total, paginationOptions),
        };
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.prismaService.user.findUnique({
            where: { userId },
        });
    }

    async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
        await this.ensureUserExists(userId);

        return this.prismaService.user.update({
            where: { userId },
            data,
        });
    }
}