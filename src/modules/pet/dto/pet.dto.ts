import { createZodDto } from "nestjs-zod";
import {
    petResponseSchema,
    createPetSchema,
    updatePetSchema,
} from "@/schemas/pet.schema";

export class PetResponseDto extends createZodDto(petResponseSchema) { }
export class CreatePetDto extends createZodDto(createPetSchema) { }
export class UpdatePetDto extends createZodDto(updatePetSchema) { }