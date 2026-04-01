import { z } from "zod";
import { createApiResponseSchema } from "@/common/api/api.schema";
import { PetType } from "@prisma/client";

export class PetValidation {
    static readonly nameSchema = z.string("Pet name is required").min(1, "Pet name cannot be empty");
    static readonly typeSchema = z.enum(PetType, {
        message: "Invalid pet type",
    });
    static readonly xpSchema = z.number("XP is required").int("XP must be an integer").nonnegative("XP must be a non-negative integer");
};

export const petSchema = z.object({
    ownerId: z.uuid(),
    name: z.string(),
    xp: z.number().int().nonnegative(),
    type: z.enum(PetType),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
});

export const petResponseSchema = createApiResponseSchema(petSchema);

export type PetData = z.infer<typeof petSchema>;

export const createPetSchema = z.object({
    name: PetValidation.nameSchema,
    type: PetValidation.typeSchema,
});

export const updatePetSchema = z.object({
    name: PetValidation.nameSchema.optional(),
    type: PetValidation.typeSchema.optional(),
    xp: PetValidation.xpSchema.optional(),
});

export const deletePetSchema = z.object({
    ownerId: z.uuid(),
});