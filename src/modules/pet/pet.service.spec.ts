import { HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { PetService } from "./pet.service";
import type { PetType } from "@prisma/client";

describe("PetService", () => {
    let service: PetService;

    const petMock = {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const prismaServiceMock = {
        pet: petMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new PetService(prismaServiceMock);
    });

    describe("findByOwnerId", () => {
        it("should return the pet for the given owner", async () => {
            const ownerId = "owner-1";
            const pet = { ownerId, name: "Buddy", type: "CAT" as PetType };
            petMock.findUnique.mockResolvedValue(pet);

            const result = await service.findByOwnerId(ownerId);

            expect(petMock.findUnique).toHaveBeenCalledWith({ where: { ownerId } });
            expect(result).toBe(pet);
        });

        it("should return null when no pet exists for the owner", async () => {
            petMock.findUnique.mockResolvedValue(null);

            const result = await service.findByOwnerId("owner-1");

            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("should create a pet when owner has no existing pet", async () => {
            const ownerId = "owner-1";
            const name = "Buddy";
            const type = "CAT" as PetType;
            const created = { ownerId, name, type, xp: 0 };

            petMock.findUnique.mockResolvedValue(null);
            petMock.create.mockResolvedValue(created);

            const result = await service.create(ownerId, name, type);

            expect(petMock.findUnique).toHaveBeenCalledWith({ where: { ownerId } });
            expect(petMock.create).toHaveBeenCalledWith({
                data: { ownerId, name, type },
            });
            expect(result).toBe(created);
        });

        it("should throw CONFLICT when owner already has a pet", async () => {
            const ownerId = "owner-1";
            petMock.findUnique.mockResolvedValue({ ownerId, name: "Existing" });

            try {
                await service.create(ownerId, "NewPet", "CAT" as PetType);
                fail("Expected create to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.CONFLICT);
                expect((error as HttpApiException).code).toBe("PET_ALREADY_EXISTS");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Pet already exists for owner with ID '${ownerId}'.`,
                    code: "PET_ALREADY_EXISTS",
                    details: null,
                });
            }

            expect(petMock.create).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("should update pet fields when pet exists", async () => {
            const ownerId = "owner-1";
            const updated = { ownerId, name: "Max", type: "DOG" as PetType, xp: 100 };

            petMock.findUnique.mockResolvedValue({ ownerId, name: "Buddy" });
            petMock.update.mockResolvedValue(updated);

            const result = await service.update(ownerId, "Max", "DOG" as PetType, 100);

            expect(petMock.findUnique).toHaveBeenCalledWith({ where: { ownerId } });
            expect(petMock.update).toHaveBeenCalledWith({
                where: { ownerId },
                data: { name: "Max", type: "DOG", xp: 100 },
            });
            expect(result).toBe(updated);
        });

        it("should update with only provided fields", async () => {
            const ownerId = "owner-1";
            petMock.findUnique.mockResolvedValue({ ownerId, name: "Buddy" });
            petMock.update.mockResolvedValue({ ownerId, name: "Max" });

            await service.update(ownerId, "Max");

            expect(petMock.update).toHaveBeenCalledWith({
                where: { ownerId },
                data: { name: "Max", type: undefined, xp: undefined },
            });
        });

        it("should throw NOT_FOUND when pet does not exist", async () => {
            const ownerId = "owner-1";
            petMock.findUnique.mockResolvedValue(null);

            try {
                await service.update(ownerId, "Max");
                fail("Expected update to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("PET_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Pet not found for owner with ID '${ownerId}'.`,
                    code: "PET_NOT_FOUND",
                    details: null,
                });
            }

            expect(petMock.update).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("should delete pet when it exists", async () => {
            const ownerId = "owner-1";
            const deleted = { ownerId, name: "Buddy" };

            petMock.findUnique.mockResolvedValue({ ownerId, name: "Buddy" });
            petMock.delete.mockResolvedValue(deleted);

            const result = await service.delete(ownerId);

            expect(petMock.findUnique).toHaveBeenCalledWith({ where: { ownerId } });
            expect(petMock.delete).toHaveBeenCalledWith({ where: { ownerId } });
            expect(result).toBe(deleted);
        });

        it("should throw NOT_FOUND when pet does not exist", async () => {
            const ownerId = "owner-1";
            petMock.findUnique.mockResolvedValue(null);

            try {
                await service.delete(ownerId);
                fail("Expected delete to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("PET_NOT_FOUND");
            }

            expect(petMock.delete).not.toHaveBeenCalled();
        });
    });
});
