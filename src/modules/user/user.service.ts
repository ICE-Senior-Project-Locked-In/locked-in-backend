import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { PaginationHelper, PaginationOptions, PaginatedResponse } from "@/common/helper/pagination.helper";
import { Prisma, User } from "@prisma/client";

export type UserFilters = {
    name?: string;
    excludeCurrentUser?: boolean;
}

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) { }

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
}