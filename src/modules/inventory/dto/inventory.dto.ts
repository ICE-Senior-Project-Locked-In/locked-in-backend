import { createZodDto } from "nestjs-zod";
import {
    inventoryItemResponseSchema,
    inventoryItemListResponseSchema,
    createInventoryItemSchema,
    updateInventoryItemSchema,
} from "@/schemas/inventory.schema";

export class InventoryItemResponseDto extends createZodDto(inventoryItemResponseSchema) { }
export class InventoryItemListResponseDto extends createZodDto(inventoryItemListResponseSchema) { }
export class CreateInventoryItemDto extends createZodDto(createInventoryItemSchema) { }
export class UpdateInventoryItemDto extends createZodDto(updateInventoryItemSchema) { }