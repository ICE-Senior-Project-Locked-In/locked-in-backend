import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";

export class InventoryValidation {
    static readonly itemIdSchema = z.uuid("Item ID is required");
    static readonly quantitySchema = z.number().int().min(0, "Quantity must be at least 0");
};

export const inventoryItemSchema = z.object({
    id: z.uuid(),
    inventoryId: z.uuid(),
    itemId: z.uuid(),
    quantity: z.number().int().min(0),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const inventoryItemResponseSchema = createApiResponseSchema(inventoryItemSchema);
export const inventoryItemListResponseSchema = createApiResponseSchema(z.array(inventoryItemSchema));

export type InventoryItemData = z.infer<typeof inventoryItemSchema>;
export type InventoryItemResponseData = z.infer<typeof inventoryItemResponseSchema>;

export const createInventoryItemSchema = z.object({
    itemId: InventoryValidation.itemIdSchema,
    quantity: InventoryValidation.quantitySchema.optional(),
});

export const updateInventoryItemSchema = z.object({
    quantity: InventoryValidation.quantitySchema,
});