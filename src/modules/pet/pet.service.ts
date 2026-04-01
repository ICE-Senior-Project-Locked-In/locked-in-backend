import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import type { PetType } from "@prisma/client";

@Injectable()
export class PetService {
    constructor(private readonly prismaService: PrismaService) { }

    private async ensurePetDoesNotExist(ownerId: string) {
        const existingPet = await this.prismaService.pet.findUnique({
            where: { ownerId },
        });

        if (existingPet) {
            throw new HttpApiException({
                status: HttpStatus.CONFLICT,
                message: `Pet already exists for owner with ID '${ownerId}'.`,
                code: "PET_ALREADY_EXISTS",
            });
        }
    }

    private async ensurePetExists(ownerId: string) {
        const existingPet = await this.prismaService.pet.findUnique({
            where: { ownerId },
        });

        if (!existingPet) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: `Pet not found for owner with ID '${ownerId}'.`,
                code: "PET_NOT_FOUND",
            });
        }
    }

    async findByOwnerId(ownerId: string) {
        return this.prismaService.pet.findUnique({
            where: { ownerId },
        });
    }

    async create(ownerId: string, name: string, type: PetType) {
        await this.ensurePetDoesNotExist(ownerId);

        return this.prismaService.pet.create({
            data: {
                ownerId,
                name,
                type,
            },
        });
    }

    async update(ownerId: string, name?: string, type?: PetType, xp?: number) {
        await this.ensurePetExists(ownerId);

        return this.prismaService.pet.update({
            where: { ownerId },
            data: {
                name,
                type,
                xp,
            },
        });
    }

    async delete(ownerId: string) {
        await this.ensurePetExists(ownerId);

        return this.prismaService.pet.delete({
            where: { ownerId },
        });
    }
}