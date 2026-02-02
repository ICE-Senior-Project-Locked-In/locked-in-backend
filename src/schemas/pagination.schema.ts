import { z } from "zod";

export const paginationQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .describe("Page number (1-indexed)"),
    itemsPerPage: z.coerce
        .number()
        .int()
        .min(5)
        .max(100)
        .optional()
        .describe("Number of items per page"),
});