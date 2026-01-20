import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAll() {
        return this.prismaService.user.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
}