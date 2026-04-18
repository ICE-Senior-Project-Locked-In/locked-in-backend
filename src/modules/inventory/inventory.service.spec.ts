import { HttpStatus } from "@nestjs/common";
import { ItemType, Prisma } from "@prisma/client";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { InventoryService } from "./inventory.service";
import type { CreateInventoryItemDto, UpdateInventoryItemDto } from "./dto/inventory.dto";

describe("InventoryService", () => {
    let service: InventoryService;

    const inventoryMock = {
        findUnique: jest.fn(),
    };

    const itemMock = {
        findUnique: jest.fn(),
    };

    const userInventoryItemMock = {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    };

    const prismaServiceMock = {
        inventory: inventoryMock,
        item: itemMock,
        userInventoryItem: userInventoryItemMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new InventoryService(prismaServiceMock);
    });

    describe("listItemsByUserId", () => {
        it("should return inventory items for the user", async () => {
            const userId = "user-1";
            const inventoryId = "inv-1";
            const items = [{ id: "item-1", inventoryId }];

            inventoryMock.findUnique.mockResolvedValue({ inventoryId, userId });
            userInventoryItemMock.findMany.mockResolvedValue(items);

            const result = await service.listItemsByUserId(userId);

            expect(inventoryMock.findUnique).toHaveBeenCalledWith({ where: { userId } });
            expect(userInventoryItemMock.findMany).toHaveBeenCalledWith({
                where: { inventoryId, item: { type: undefined } },
            });
            expect(result).toBe(items);
        });

        it("should filter by item type when provided", async () => {
            const userId = "user-1";
            const inventoryId = "inv-1";

            inventoryMock.findUnique.mockResolvedValue({ inventoryId, userId });
            userInventoryItemMock.findMany.mockResolvedValue([]);

            await service.listItemsByUserId(userId, ItemType.PET_FOOD);

            expect(userInventoryItemMock.findMany).toHaveBeenCalledWith({
                where: { inventoryId, item: { type: ItemType.PET_FOOD } },
            });
        });

        it("should throw NOT_FOUND when user inventory does not exist", async () => {
            const userId = "user-missing";
            inventoryMock.findUnique.mockResolvedValue(null);

            try {
                await service.listItemsByUserId(userId);
                fail("Expected listItemsByUserId to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("INVENTORY_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Inventory not found for user with ID '${userId}'.`,
                    code: "INVENTORY_NOT_FOUND",
                    details: null,
                });
            }

            expect(userInventoryItemMock.findMany).not.toHaveBeenCalled();
        });
    });

    describe("createItem", () => {
        it("should create inventory item when inventory and item exist", async () => {
            const userId = "user-1";
            const inventoryId = "inv-1";
            const data: CreateInventoryItemDto = {
                itemId: "item-1",
                quantity: 2,
            } as CreateInventoryItemDto;
            const created = { id: "ui-1", inventoryId, itemId: data.itemId, quantity: 2 };

            inventoryMock.findUnique.mockResolvedValue({ inventoryId, userId });
            itemMock.findUnique.mockResolvedValue({ itemId: data.itemId });
            userInventoryItemMock.create.mockResolvedValue(created);

            const result = await service.createItem(userId, data);

            expect(inventoryMock.findUnique).toHaveBeenCalledWith({ where: { userId } });
            expect(itemMock.findUnique).toHaveBeenCalledWith({ where: { itemId: data.itemId } });
            const { itemId, ...itemData } = data;
            expect(userInventoryItemMock.create).toHaveBeenCalledWith({
                data: { inventoryId, itemId, ...itemData },
            });
            expect(result).toBe(created);
        });

        it("should throw NOT_FOUND when inventory does not exist", async () => {
            const userId = "user-missing";
            inventoryMock.findUnique.mockResolvedValue(null);

            try {
                await service.createItem(userId, { itemId: "item-1" } as CreateInventoryItemDto);
                fail("Expected createItem to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("INVENTORY_NOT_FOUND");
            }

            expect(userInventoryItemMock.create).not.toHaveBeenCalled();
        });

        it("should throw NOT_FOUND when item does not exist", async () => {
            const userId = "user-1";
            const itemId = "item-missing";

            inventoryMock.findUnique.mockResolvedValue({ inventoryId: "inv-1", userId });
            itemMock.findUnique.mockResolvedValue(null);

            try {
                await service.createItem(userId, { itemId } as CreateInventoryItemDto);
                fail("Expected createItem to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("ITEM_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Item not found with ID '${itemId}'.`,
                    code: "ITEM_NOT_FOUND",
                    details: null,
                });
            }

            expect(userInventoryItemMock.create).not.toHaveBeenCalled();
        });

        it("should throw CONFLICT when item already exists in inventory (P2002)", async () => {
            const userId = "user-1";
            const itemId = "item-1";

            inventoryMock.findUnique.mockResolvedValue({ inventoryId: "inv-1", userId });
            itemMock.findUnique.mockResolvedValue({ itemId });

            const p2002Error = new Prisma.PrismaClientKnownRequestError(
                "Unique constraint failed",
                { code: "P2002", clientVersion: "5.0.0" }
            );
            userInventoryItemMock.create.mockRejectedValue(p2002Error);

            try {
                await service.createItem(userId, { itemId } as CreateInventoryItemDto);
                fail("Expected createItem to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.CONFLICT);
                expect((error as HttpApiException).code).toBe("INVENTORY_ITEM_ALREADY_EXISTS");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Item with ID '${itemId}' already exists in user's inventory.`,
                    code: "INVENTORY_ITEM_ALREADY_EXISTS",
                    details: null,
                });
            }
        });

        it("should rethrow unexpected errors from create", async () => {
            const userId = "user-1";
            const unexpectedError = new Error("Database connection lost");

            inventoryMock.findUnique.mockResolvedValue({ inventoryId: "inv-1", userId });
            itemMock.findUnique.mockResolvedValue({ itemId: "item-1" });
            userInventoryItemMock.create.mockRejectedValue(unexpectedError);

            await expect(
                service.createItem(userId, { itemId: "item-1" } as CreateInventoryItemDto)
            ).rejects.toThrow("Database connection lost");
        });
    });

    describe("updateItem", () => {
        it("should update inventory item when item exists", async () => {
            const userId = "user-1";
            const itemId = "item-1";
            const data: UpdateInventoryItemDto = { quantity: 5 } as UpdateInventoryItemDto;
            const existingItem = { inventoryId: userId, itemId };
            const updated = { ...existingItem, quantity: 5 };

            userInventoryItemMock.findUnique.mockResolvedValue(existingItem);
            userInventoryItemMock.update.mockResolvedValue(updated);

            const result = await service.updateItem(userId, itemId, data);

            expect(userInventoryItemMock.findUnique).toHaveBeenCalledWith({
                where: { inventoryId_itemId: { inventoryId: userId, itemId } },
            });
            expect(userInventoryItemMock.update).toHaveBeenCalledWith({
                where: { inventoryId_itemId: { inventoryId: userId, itemId } },
                data,
            });
            expect(result).toBe(updated);
        });

        it("should throw NOT_FOUND when inventory item does not exist", async () => {
            const userId = "user-1";
            const itemId = "item-missing";
            userInventoryItemMock.findUnique.mockResolvedValue(null);

            try {
                await service.updateItem(userId, itemId, {} as UpdateInventoryItemDto);
                fail("Expected updateItem to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("INVENTORY_ITEM_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Item not found with ID '${itemId}' in user's inventory.`,
                    code: "INVENTORY_ITEM_NOT_FOUND",
                    details: null,
                });
            }

            expect(userInventoryItemMock.update).not.toHaveBeenCalled();
        });
    });
});
