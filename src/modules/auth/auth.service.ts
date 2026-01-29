import { HttpStatus, Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { MasterDataService } from "@/database/master-data/master-data.service";
import { PrismaService } from "@/database/prisma.service";
import { RedisService } from "@/infrastructure/redis/redis.service";
import { config } from "@/config/env";
import type { LoginData, RegisterData } from "@/schemas/auth.schema";
import { HttpApiException } from "@/common/exceptions/http-api.exception";

const refreshTokenExpiresInDays = Number.parseInt(
    config.refreshTokenExpiresIn.replace("d", ""),
    10
);

if (Number.isNaN(refreshTokenExpiresInDays)) {
    throw new TypeError(
        "Invalid REFRESH_TOKEN_EXPIRES_IN value. Use the format '<number>d'."
    );
}

const REFRESH_TOKEN_TTL = refreshTokenExpiresInDays * 24 * 60 * 60;
export const refreshTokenCookieMaxAgeMs = REFRESH_TOKEN_TTL * 1000;

const generateRefreshToken = () => randomBytes(64).toString("hex");

const accessTokenExpiresIn = config.accessTokenExpiresIn as jwt.SignOptions["expiresIn"];
const refreshTokenExpiresIn = config.refreshTokenExpiresIn as jwt.SignOptions["expiresIn"];

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly master: MasterDataService,
        private readonly redisService: RedisService
    ) { }

    private get redis() {
        return this.redisService.getClient();
    }

    private generateAccessToken(userId: string, email: string) {
        return jwt.sign({ userId, email }, config.jwtSecret as jwt.Secret, {
            expiresIn: accessTokenExpiresIn,
        });
    }

    private generateRefreshTokenJWT(userId: string, token: string) {
        return jwt.sign({ userId, token }, config.jwtRefreshSecret as jwt.Secret, {
            expiresIn: refreshTokenExpiresIn,
        });
    }

    private getRefreshTokenKey(token: string) {
        return `refreshToken:${token}`;
    }

    private async storeRefreshToken(token: string, userId: string) {
        const key = this.getRefreshTokenKey(token);
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + REFRESH_TOKEN_TTL);

        const value = JSON.stringify({
            userId,
            expiresAt: expiresAt.toISOString(),
        });

        await this.redis.setex(key, REFRESH_TOKEN_TTL, value);
    }

    private async getRefreshToken(token: string) {
        const key = this.getRefreshTokenKey(token);
        const value = await this.redis.get(key);
        if (!value) {
            return null;
        }

        return JSON.parse(value) as { userId: string; expiresAt: string };
    }

    private async deleteRefreshToken(token: string) {
        const key = this.getRefreshTokenKey(token);
        await this.redis.del(key);
    }

    async register(data: RegisterData) {
        const { email, password, name } = data;

        const existingUser = await this.prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            throw new HttpApiException({
                status: HttpStatus.CONFLICT,
                message: "User with this email already exists",
                code: "USER_EXISTS",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const unblockActionIds = this.master.getUnblockActionIds();
        const focusTypeIds = this.master.getFocusTypeIds();

        const user = await this.prisma.user.create({
            data: {
                email,
                name: name || null,
                credential: {
                    create: {
                        password: hashedPassword,
                    },
                },
                userUnblockActions: {
                    create: unblockActionIds.map((actionId) => ({
                        actionId,
                    })),
                },
                userFocusTypes: {
                    create: focusTypeIds.map((typeId) => ({
                        typeId,
                    })),
                },
                inventory: {
                    create: {}
                }
            },
        });

        const refreshTokenValue = generateRefreshToken();
        await this.storeRefreshToken(refreshTokenValue, user.userId);

        const accessToken = this.generateAccessToken(user.userId, user.email);
        const refreshToken = this.generateRefreshTokenJWT(
            user.userId,
            refreshTokenValue
        );

        return { user, accessToken, refreshToken };
    }

    async login(data: LoginData) {
        const { email, password } = data;

        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { credential: true }
        });

        if (!user?.credential) {
            throw new HttpApiException({
                status: HttpStatus.UNAUTHORIZED,
                message: "User and credential not found",
                code: "INVALID_CREDENTIALS",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.credential.password);

        if (!isPasswordValid) {
            throw new HttpApiException({
                status: HttpStatus.UNAUTHORIZED,
                message: "Invalid email or password",
                code: "INVALID_CREDENTIALS",
            });
        }

        const refreshTokenValue = generateRefreshToken();
        await this.storeRefreshToken(refreshTokenValue, user.userId);

        const accessToken = this.generateAccessToken(user.userId, user.email);
        const refreshToken = this.generateRefreshTokenJWT(
            user.userId,
            refreshTokenValue
        );

        return {
            user: {
                userId: user.userId,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshAccessToken(refreshTokenJWT: string) {
        try {
            const decoded = jwt.verify(
                refreshTokenJWT,
                config.jwtRefreshSecret
            ) as { userId: string; token: string };

            const tokenData = await this.getRefreshToken(decoded.token);

            if (!tokenData) {
                throw new HttpApiException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN",
                });
            }

            const expiresAt = new Date(tokenData.expiresAt);
            if (expiresAt < new Date()) {
                await this.deleteRefreshToken(decoded.token);
                throw new HttpApiException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Refresh token expired",
                    code: "REFRESH_TOKEN_EXPIRED",
                });
            }

            if (tokenData.userId !== decoded.userId) {
                throw new HttpApiException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN",
                });
            }

            const user = await this.prisma.user.findUnique({
                where: { userId: tokenData.userId },
            });

            if (!user) {
                throw new HttpApiException({
                    status: HttpStatus.NOT_FOUND,
                    message: "User not found",
                    code: "USER_NOT_FOUND",
                });
            }

            const newRefreshTokenValue = generateRefreshToken();
            await this.storeRefreshToken(newRefreshTokenValue, user.userId);
            await this.deleteRefreshToken(decoded.token).catch((error) => {
                console.error("Failed to delete old refresh token", error);
            });

            const newRefreshToken = this.generateRefreshTokenJWT(
                user.userId,
                newRefreshTokenValue
            );
            const accessToken = this.generateAccessToken(user.userId, user.email);

            return {
                user,
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            if (error instanceof HttpApiException) {
                throw error;
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new HttpApiException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Refresh token expired",
                    code: "REFRESH_TOKEN_EXPIRED",
                });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new HttpApiException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN",
                });
            }
            throw error;
        }
    }

    async logout(refreshTokenJWT: string) {
        try {
            const decoded = jwt.verify(
                refreshTokenJWT,
                config.jwtRefreshSecret
            ) as { token: string };
            await this.deleteRefreshToken(decoded.token);
        } catch (error) {
            console.error("Failed to revoke refresh token on logout", error);
        }
    }

    async revokeRefreshToken(refreshTokenJWT: string) {
        try {
            const decoded = jwt.verify(
                refreshTokenJWT,
                config.jwtRefreshSecret
            ) as { token: string };
            await this.deleteRefreshToken(decoded.token);
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new HttpApiException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN",
                });
            }
            throw error;
        }
    }

    async getUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
        });

        if (!user) {
            throw new HttpApiException({
                status: HttpStatus.NOT_FOUND,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        return user;
    }
}
