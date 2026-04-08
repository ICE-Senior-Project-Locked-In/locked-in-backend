import { HttpStatus } from "@nestjs/common";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { FocusTypeService } from "./focus-type.service";

describe("FocusTypeService", () => {
    let service: FocusTypeService;

    const focusTypeMock = {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    };

    const userFocusTypeMock = {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
    };

    const prismaServiceMock = {
        focusType: focusTypeMock,
        userFocusType: userFocusTypeMock,
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new FocusTypeService(prismaServiceMock);
    });

    describe("getAllFocusTypes", () => {
        it("should return all focus types", async () => {
            const types = [{ typeId: "t1" }, { typeId: "t2" }];
            focusTypeMock.findMany.mockResolvedValue(types);

            const result = await service.getAllFocusTypes();

            expect(focusTypeMock.findMany).toHaveBeenCalledWith();
            expect(result).toBe(types);
        });
    });

    describe("getDefaultFocusTypes", () => {
        it("should return only default focus types", async () => {
            const defaultTypes = [{ typeId: "t1", isDefault: true }];
            focusTypeMock.findMany.mockResolvedValue(defaultTypes);

            const result = await service.getDefaultFocusTypes();

            expect(focusTypeMock.findMany).toHaveBeenCalledWith({
                where: { isDefault: true },
            });
            expect(result).toBe(defaultTypes);
        });
    });

    describe("getUserFocusTypes", () => {
        it("should return focus types mapped from user focus type records", async () => {
            const userId = "user-1";
            const userFocusTypes = [
                { focusType: { typeId: "t1", name: "Study" } },
                { focusType: { typeId: "t2", name: "Work" } },
            ];
            userFocusTypeMock.findMany.mockResolvedValue(userFocusTypes);

            const result = await service.getUserFocusTypes(userId);

            expect(userFocusTypeMock.findMany).toHaveBeenCalledWith({
                where: { userId },
                include: { focusType: true },
            });
            expect(result).toEqual([
                { typeId: "t1", name: "Study" },
                { typeId: "t2", name: "Work" },
            ]);
        });

        it("should return null when query returns null", async () => {
            userFocusTypeMock.findMany.mockResolvedValue(null);

            const result = await service.getUserFocusTypes("user-1");

            expect(result).toBeNull();
        });

        it("should return empty array when user has no focus types", async () => {
            userFocusTypeMock.findMany.mockResolvedValue([]);

            const result = await service.getUserFocusTypes("user-1");

            expect(result).toEqual([]);
        });
    });

    describe("createFocusType", () => {
        it("should create a focus type when name does not exist", async () => {
            const name = "Deep Work";
            const created = { typeId: "t1", name };

            focusTypeMock.findFirst.mockResolvedValue(null);
            focusTypeMock.create.mockResolvedValue(created);

            const result = await service.createFocusType(name);

            expect(focusTypeMock.findFirst).toHaveBeenCalledWith({ where: { name } });
            expect(focusTypeMock.create).toHaveBeenCalledWith({ data: { name } });
            expect(result).toBe(created);
        });

        it("should throw CONFLICT when focus type name already exists", async () => {
            const name = "Deep Work";
            focusTypeMock.findFirst.mockResolvedValue({ typeId: "t1", name });

            try {
                await service.createFocusType(name);
                fail("Expected createFocusType to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.CONFLICT);
                expect((error as HttpApiException).code).toBe("FOCUS_TYPE_ALREADY_EXISTS");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `Focus type with name '${name}' already exists.`,
                    code: "FOCUS_TYPE_ALREADY_EXISTS",
                    details: null,
                });
            }

            expect(focusTypeMock.create).not.toHaveBeenCalled();
        });
    });

    describe("createUserFocusType", () => {
        it("should create user focus type when pair does not exist", async () => {
            const userId = "user-1";
            const typeId = "type-1";
            const created = { id: "uf-1", userId, typeId };

            userFocusTypeMock.findFirst.mockResolvedValue(null);
            userFocusTypeMock.create.mockResolvedValue(created);

            const result = await service.createUserFocusType(userId, typeId);

            expect(userFocusTypeMock.findFirst).toHaveBeenCalledWith({
                where: { userId, typeId },
            });
            expect(userFocusTypeMock.create).toHaveBeenCalledWith({
                data: { userId, typeId },
            });
            expect(result).toBe(created);
        });

        it("should throw CONFLICT when user focus type pair already exists", async () => {
            const userId = "user-1";
            const typeId = "type-1";
            userFocusTypeMock.findFirst.mockResolvedValue({ userId, typeId });

            try {
                await service.createUserFocusType(userId, typeId);
                fail("Expected createUserFocusType to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.CONFLICT);
                expect((error as HttpApiException).code).toBe("USER_FOCUS_TYPE_ALREADY_EXISTS");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: `User focus type with typeId '${typeId}' already exists for user '${userId}'.`,
                    code: "USER_FOCUS_TYPE_ALREADY_EXISTS",
                    details: null,
                });
            }

            expect(userFocusTypeMock.create).not.toHaveBeenCalled();
        });
    });

    describe("deleteUserFocusType", () => {
        it("should delete user focus type by userId and typeId", async () => {
            const userId = "user-1";
            const typeId = "type-1";
            const deletedCount = { count: 1 };

            userFocusTypeMock.deleteMany.mockResolvedValue(deletedCount);

            const result = await service.deleteUserFocusType(userId, typeId);

            expect(userFocusTypeMock.deleteMany).toHaveBeenCalledWith({
                where: { userId, typeId },
            });
            expect(result).toBe(deletedCount);
        });
    });
});
