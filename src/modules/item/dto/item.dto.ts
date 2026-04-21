import { createZodDto } from "nestjs-zod";
import { itemListResponseSchema, listItemsQuerySchema } from "@/schemas/item.schema";

export class ItemListResponseDto extends createZodDto(itemListResponseSchema) {}
export class ListItemsQueryDto extends createZodDto(listItemsQuerySchema) {}
