import { z } from "zod";

export const baseResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().nullable(),
    timestamp: z.iso.datetime(),
});

export const createApiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
    baseResponseSchema.extend({
        data: schema.nullable(),
    });

export const emptyResponseSchema = createApiResponseSchema(z.null());