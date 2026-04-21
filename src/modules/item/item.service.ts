import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import type { ItemType } from "@prisma/client";

@Injectable()
export class ItemService {
    constructor(private readonly prismaService: PrismaService) {}

    listItems(type?: ItemType) {
        return this.prismaService.item.findMany({
            where: type ? { type } : undefined,
            orderBy: { name: "asc" },
        });
    }
}
