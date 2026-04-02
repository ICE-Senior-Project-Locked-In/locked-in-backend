import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { Prisma, ItemType } from "@prisma/client";
import type { CreateInventoryItemDto, UpdateInventoryItemDto } from "./dto/inventory.dto";

@Injectable()
export class InventoryService {
    constructor(private readonly prismaService: PrismaService) { }

    private async ensureInventoryExists(userId: string) {
        const existingInventory = await this.prismaService.inventory.findUnique({
            where: { userId },
        });

        if (!existingInventory) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `Inventory not found for user with ID '${userId}'.`,
                code: "INVENTORY_NOT_FOUND",
            });
        }

        return { inventoryId: existingInventory.inventoryId };
    }

    private async ensureItemExists(itemId: string) {
        const existingItem = await this.prismaService.item.findUnique({
            where: { itemId },
        });

        if (!existingItem) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `Item not found with ID '${itemId}'.`,
                code: "ITEM_NOT_FOUND",
            });
        }
    }

    private async ensureUserItemExists(inventoryId: string, itemId: string) {
        const existingItem = await this.prismaService.userInventoryItem.findUnique({
            where: {
                inventoryId_itemId: {
                    inventoryId,
                    itemId,
                },
            },
        });

        if (!existingItem) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `Item not found with ID '${itemId}' in user's inventory.`,
                code: "INVENTORY_ITEM_NOT_FOUND",
            });
        }

        return { inventoryId, existingItem };
    }

    async listItemsByUserId(userId: string, itemType?: ItemType) {
        const { inventoryId } = await this.ensureInventoryExists(userId);

        return this.prismaService.userInventoryItem.findMany({
            where: {
                inventoryId,
                item: {
                    type: itemType,
                },
            },
        });
    }

    async createItem(userId: string, data: CreateInventoryItemDto) {
        const { inventoryId } = await this.ensureInventoryExists(userId);
        const { itemId, quantity } = data;

        await this.ensureItemExists(itemId);

        try {
            return await this.prismaService.userInventoryItem.create({
                data: {
                    inventoryId,
                    itemId,
                    quantity,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new HttpApiException({
                    status: HttpStatus.CONFLICT,
                    message: `Item with ID '${itemId}' already exists in user's inventory.`,
                    code: "INVENTORY_ITEM_ALREADY_EXISTS",
                });
            }

            throw error;
        }
    }

    async updateItem(userId: string, itemId: string, data: UpdateInventoryItemDto) {
        const { inventoryId } = await this.ensureUserItemExists(userId, itemId);
        const { quantity } = data;

        return this.prismaService.userInventoryItem.update({
            where: {
                inventoryId_itemId: {
                    inventoryId,
                    itemId,
                },
            },
            data: {
                quantity,
            },
        });
    }
}