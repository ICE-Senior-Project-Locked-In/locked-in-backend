jest.mock("@/config/env", () => ({
    config: {
        refreshTokenExpiresIn: "7d",
        accessTokenExpiresIn: "15m",
        jwtSecret: "test-jwt-secret",
        jwtRefreshSecret: "test-jwt-refresh-secret",
    },
}));

jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => {
    class TokenExpiredError extends Error {
        expiredAt: Date;
        constructor(message: string, expiredAt: Date) {
            super(message);
            this.name = "TokenExpiredError";
            this.expiredAt = expiredAt;
        }
    }
    class JsonWebTokenError extends Error {
        constructor(message: string) {
            super(message);
            this.name = "JsonWebTokenError";
        }
    }
    return {
        sign: jest.fn(),
        verify: jest.fn(),
        TokenExpiredError,
        JsonWebTokenError,
    };
});

import { HttpStatus } from "@nestjs/common";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { PrismaService } from "@/database/prisma.service";
import { MasterDataService } from "@/database/master-data/master-data.service";
import { RedisService } from "@/infrastructure/redis/redis.service";
import { AuthService } from "./auth.service";
import type { LoginData, RegisterData } from "@/schemas/auth.schema";

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;

describe("AuthService", () => {
    let service: AuthService;

    const userMock = {
        findUnique: jest.fn(),
        create: jest.fn(),
    };

    const prismaServiceMock = {
        user: userMock,
    } as unknown as PrismaService;

    const masterDataServiceMock = {
        getUnblockActionIds: jest.fn().mockReturnValue(["action-1", "action-2"]),
        getFocusTypeIds: jest.fn().mockReturnValue(["type-1", "type-2"]),
    } as unknown as MasterDataService;

    const redisClientMock = {
        setex: jest.fn().mockResolvedValue("OK"),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(1),
    };

    const redisServiceMock = {
        getClient: jest.fn().mockReturnValue(redisClientMock),
    } as unknown as RedisService;

    const mockUser = {
        userId: "user-1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        redisServiceMock.getClient = jest.fn().mockReturnValue(redisClientMock);
        redisClientMock.setex.mockResolvedValue("OK");
        redisClientMock.del.mockResolvedValue(1);
        service = new AuthService(prismaServiceMock, masterDataServiceMock, redisServiceMock);
    });

    describe("register", () => {
        const registerData: RegisterData = {
            email: "test@example.com",
            password: "password123",
            name: "Test User",
        };

        it("should register a new user, store refresh token, and return tokens", async () => {
            userMock.findUnique.mockResolvedValue(null);
            (bcryptMock.hash as jest.Mock).mockResolvedValue("hashed-password");
            userMock.create.mockResolvedValue(mockUser);
            (jwtMock.sign as jest.Mock)
                .mockReturnValueOnce("access-token")
                .mockReturnValueOnce("refresh-token-jwt");

            const result = await service.register(registerData);

            expect(userMock.findUnique).toHaveBeenCalledWith({ where: { email: registerData.email } });
            expect(bcryptMock.hash).toHaveBeenCalledWith(registerData.password, 10);
            expect(userMock.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        email: registerData.email,
                        name: registerData.name,
                    }),
                })
            );
            expect(redisClientMock.setex).toHaveBeenCalled();
            expect(result.user).toBe(mockUser);
            expect(result.accessToken).toBe("access-token");
            expect(result.refreshToken).toBe("refresh-token-jwt");
        });

        it("should create user with default unblock actions and focus types", async () => {
            userMock.findUnique.mockResolvedValue(null);
            (bcryptMock.hash as jest.Mock).mockResolvedValue("hashed-password");
            userMock.create.mockResolvedValue(mockUser);
            (jwtMock.sign as jest.Mock).mockReturnValue("token");

            await service.register(registerData);

            expect(userMock.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userUnblockActions: {
                            create: [{ actionId: "action-1" }, { actionId: "action-2" }],
                        },
                        userFocusTypes: {
                            create: [{ typeId: "type-1" }, { typeId: "type-2" }],
                        },
                        inventory: { create: {} },
                    }),
                })
            );
        });

        it("should use null for name when name is not provided", async () => {
            userMock.findUnique.mockResolvedValue(null);
            (bcryptMock.hash as jest.Mock).mockResolvedValue("hashed-password");
            userMock.create.mockResolvedValue(mockUser);
            (jwtMock.sign as jest.Mock).mockReturnValue("token");

            await service.register({ email: "test@example.com", password: "pass" });

            expect(userMock.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ name: null }),
                })
            );
        });

        it("should throw CONFLICT when email is already registered", async () => {
            userMock.findUnique.mockResolvedValue(mockUser);

            try {
                await service.register(registerData);
                fail("Expected register to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.CONFLICT);
                expect((error as HttpApiException).code).toBe("USER_EXISTS");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: "User with this email already exists",
                    code: "USER_EXISTS",
                    details: null,
                });
            }

            expect(userMock.create).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        const loginData: LoginData = {
            email: "test@example.com",
            password: "password123",
        };

        it("should return tokens and user profile on valid credentials", async () => {
            const userWithCredential = {
                ...mockUser,
                credential: { password: "hashed-password" },
            };

            userMock.findUnique.mockResolvedValue(userWithCredential);
            (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
            (jwtMock.sign as jest.Mock)
                .mockReturnValueOnce("access-token")
                .mockReturnValueOnce("refresh-token-jwt");

            const result = await service.login(loginData);

            expect(userMock.findUnique).toHaveBeenCalledWith({
                where: { email: loginData.email },
                include: { credential: true },
            });
            expect(bcryptMock.compare).toHaveBeenCalledWith(loginData.password, "hashed-password");
            expect(redisClientMock.setex).toHaveBeenCalled();
            expect(result.user.userId).toBe(mockUser.userId);
            expect(result.user.email).toBe(mockUser.email);
            expect(result.accessToken).toBe("access-token");
            expect(result.refreshToken).toBe("refresh-token-jwt");
        });

        it("should throw UNAUTHORIZED when user is not found", async () => {
            userMock.findUnique.mockResolvedValue(null);

            try {
                await service.login(loginData);
                fail("Expected login to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("INVALID_CREDENTIALS");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: "User and credential not found",
                    code: "INVALID_CREDENTIALS",
                    details: null,
                });
            }

            expect(bcryptMock.compare).not.toHaveBeenCalled();
        });

        it("should throw UNAUTHORIZED when user has no credential", async () => {
            userMock.findUnique.mockResolvedValue({ ...mockUser, credential: null });

            try {
                await service.login(loginData);
                fail("Expected login to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("INVALID_CREDENTIALS");
            }

            expect(bcryptMock.compare).not.toHaveBeenCalled();
        });

        it("should throw UNAUTHORIZED when password does not match", async () => {
            userMock.findUnique.mockResolvedValue({
                ...mockUser,
                credential: { password: "hashed-password" },
            });
            (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

            try {
                await service.login(loginData);
                fail("Expected login to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("INVALID_CREDENTIALS");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: "Invalid email or password",
                    code: "INVALID_CREDENTIALS",
                    details: null,
                });
            }

            expect(redisClientMock.setex).not.toHaveBeenCalled();
        });
    });

    describe("refreshAccessToken", () => {
        const makeRefreshJwt = () => "valid-refresh-jwt";

        it("should rotate tokens on a valid and unexpired refresh token", async () => {
            const decoded = { userId: "user-1", token: "raw-token" };
            const storedToken = {
                userId: "user-1",
                expiresAt: new Date(Date.now() + 60000).toISOString(),
            };

            (jwtMock.verify as jest.Mock).mockReturnValue(decoded);
            redisClientMock.get.mockResolvedValue(JSON.stringify(storedToken));
            userMock.findUnique.mockResolvedValue(mockUser);
            // refreshAccessToken calls generateRefreshTokenJWT first, then generateAccessToken
            (jwtMock.sign as jest.Mock)
                .mockReturnValueOnce("new-refresh-jwt")
                .mockReturnValueOnce("new-access-token");

            const result = await service.refreshAccessToken(makeRefreshJwt());

            expect(redisClientMock.get).toHaveBeenCalled();
            expect(redisClientMock.setex).toHaveBeenCalled();
            expect(result.user).toBe(mockUser);
            expect(result.accessToken).toBe("new-access-token");
            expect(result.refreshToken).toBe("new-refresh-jwt");
        });

        it("should throw INVALID_REFRESH_TOKEN when token is not in Redis", async () => {
            (jwtMock.verify as jest.Mock).mockReturnValue({ userId: "user-1", token: "raw-token" });
            redisClientMock.get.mockResolvedValue(null);

            try {
                await service.refreshAccessToken(makeRefreshJwt());
                fail("Expected refreshAccessToken to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("INVALID_REFRESH_TOKEN");
            }

            expect(userMock.findUnique).not.toHaveBeenCalled();
        });

        it("should throw REFRESH_TOKEN_EXPIRED when stored token is past its expiry", async () => {
            const decoded = { userId: "user-1", token: "raw-token" };
            const expiredToken = {
                userId: "user-1",
                expiresAt: new Date(Date.now() - 1000).toISOString(),
            };

            (jwtMock.verify as jest.Mock).mockReturnValue(decoded);
            redisClientMock.get.mockResolvedValue(JSON.stringify(expiredToken));

            try {
                await service.refreshAccessToken(makeRefreshJwt());
                fail("Expected refreshAccessToken to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("REFRESH_TOKEN_EXPIRED");
            }

            expect(redisClientMock.del).toHaveBeenCalled();
            expect(userMock.findUnique).not.toHaveBeenCalled();
        });

        it("should throw INVALID_REFRESH_TOKEN when stored userId does not match JWT userId", async () => {
            const decoded = { userId: "user-1", token: "raw-token" };
            const storedToken = {
                userId: "user-DIFFERENT",
                expiresAt: new Date(Date.now() + 60000).toISOString(),
            };

            (jwtMock.verify as jest.Mock).mockReturnValue(decoded);
            redisClientMock.get.mockResolvedValue(JSON.stringify(storedToken));

            try {
                await service.refreshAccessToken(makeRefreshJwt());
                fail("Expected refreshAccessToken to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("INVALID_REFRESH_TOKEN");
            }
        });

        it("should throw USER_NOT_FOUND when user no longer exists", async () => {
            const decoded = { userId: "user-deleted", token: "raw-token" };
            const storedToken = {
                userId: "user-deleted",
                expiresAt: new Date(Date.now() + 60000).toISOString(),
            };

            (jwtMock.verify as jest.Mock).mockReturnValue(decoded);
            redisClientMock.get.mockResolvedValue(JSON.stringify(storedToken));
            userMock.findUnique.mockResolvedValue(null);

            try {
                await service.refreshAccessToken(makeRefreshJwt());
                fail("Expected refreshAccessToken to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("USER_NOT_FOUND");
            }
        });

        it("should throw REFRESH_TOKEN_EXPIRED when JWT is expired", async () => {
            const expiredError = new jwt.TokenExpiredError("jwt expired", new Date());
            (jwtMock.verify as jest.Mock).mockImplementation(() => { throw expiredError; });

            try {
                await service.refreshAccessToken(makeRefreshJwt());
                fail("Expected refreshAccessToken to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("REFRESH_TOKEN_EXPIRED");
            }
        });

        it("should throw INVALID_REFRESH_TOKEN when JWT signature is invalid", async () => {
            const jwtError = new jwt.JsonWebTokenError("invalid signature");
            (jwtMock.verify as jest.Mock).mockImplementation(() => { throw jwtError; });

            try {
                await service.refreshAccessToken(makeRefreshJwt());
                fail("Expected refreshAccessToken to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("INVALID_REFRESH_TOKEN");
            }
        });
    });

    describe("logout", () => {
        it("should delete the refresh token from Redis", async () => {
            (jwtMock.verify as jest.Mock).mockReturnValue({ token: "raw-token" });

            await service.logout("valid-refresh-jwt");

            expect(jwtMock.verify).toHaveBeenCalled();
            expect(redisClientMock.del).toHaveBeenCalled();
        });

        it("should silently ignore errors on logout", async () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            (jwtMock.verify as jest.Mock).mockImplementation(() => {
                throw new Error("Invalid token");
            });

            await expect(service.logout("bad-token")).resolves.toBeUndefined();

            consoleSpy.mockRestore();
        });
    });

    describe("revokeRefreshToken", () => {
        it("should delete the refresh token from Redis", async () => {
            (jwtMock.verify as jest.Mock).mockReturnValue({ token: "raw-token" });

            await service.revokeRefreshToken("valid-refresh-jwt");

            expect(redisClientMock.del).toHaveBeenCalled();
        });

        it("should throw INVALID_REFRESH_TOKEN when JWT is invalid", async () => {
            const jwtError = new jwt.JsonWebTokenError("invalid token");
            (jwtMock.verify as jest.Mock).mockImplementation(() => { throw jwtError; });

            try {
                await service.revokeRefreshToken("bad-token");
                fail("Expected revokeRefreshToken to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
                expect((error as HttpApiException).code).toBe("INVALID_REFRESH_TOKEN");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN",
                    details: null,
                });
            }
        });

        it("should rethrow non-JWT errors", async () => {
            const unexpectedError = new Error("Redis connection lost");
            (jwtMock.verify as jest.Mock).mockReturnValue({ token: "raw-token" });
            redisClientMock.del.mockRejectedValue(unexpectedError);

            await expect(service.revokeRefreshToken("valid-refresh-jwt")).rejects.toThrow(
                "Redis connection lost"
            );
        });
    });

    describe("getUserById", () => {
        it("should return user when found", async () => {
            userMock.findUnique.mockResolvedValue(mockUser);

            const result = await service.getUserById("user-1");

            expect(userMock.findUnique).toHaveBeenCalledWith({ where: { userId: "user-1" } });
            expect(result).toBe(mockUser);
        });

        it("should throw NOT_FOUND when user does not exist", async () => {
            userMock.findUnique.mockResolvedValue(null);

            try {
                await service.getUserById("user-missing");
                fail("Expected getUserById to throw HttpApiException");
            } catch (error) {
                expect(error).toBeInstanceOf(HttpApiException);
                expect((error as HttpApiException).getStatus()).toBe(HttpStatus.NOT_FOUND);
                expect((error as HttpApiException).code).toBe("USER_NOT_FOUND");
                expect((error as HttpApiException).getResponse()).toEqual({
                    message: "User not found",
                    code: "USER_NOT_FOUND",
                    details: null,
                });
            }
        });
    });
});
