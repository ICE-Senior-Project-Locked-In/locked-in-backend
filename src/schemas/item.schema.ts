import { z } from "zod";
import { ItemType } from "@prisma/client";
import { createApiResponseSchema } from "@/common/api/api.schema";

export const itemSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    type: z.enum(ItemType),
    price: z.number().int().min(0),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const itemListResponseSchema = createApiResponseSchema(z.array(itemSchema));

export type ItemData = z.infer<typeof itemSchema>;

export const listItemsQuerySchema = z.object({
    type: z.enum(ItemType).optional(),
});
