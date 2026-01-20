import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import type { Request, Response, CookieOptions } from "express";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthService, refreshTokenCookieMaxAgeMs } from "@/modules/auth/auth.service";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import { ResponseMessage } from "@/common/http/decorators/response-message.decorator";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { HttpApiException } from "@/common/exceptions/http-api.exception";
import { EmptyResponseDto } from "@/common/dto/common.dto";
import {
    AuthResponseDto,
    CurrentUserResponseDto,
    LoginDto,
    RegisterDto,
} from "@/modules/auth/dto/auth.dto";
import { AppLogger } from "@/logger/app-logger.service";
import { config } from "@/config/env";

const refreshCookieBaseOptions: CookieOptions = {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.refreshTokenCookieSameSite,
    path: "/",
};

if (config.refreshTokenCookieDomain) {
    refreshCookieBaseOptions.domain = config.refreshTokenCookieDomain;
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie("refreshToken", token, {
        ...refreshCookieBaseOptions,
        maxAge: refreshTokenCookieMaxAgeMs,
    });
};

const clearRefreshTokenCookie = (res: Response) => {
    res.clearCookie("refreshToken", refreshCookieBaseOptions);
};

@ApiTags("Auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(AuthController.name);
    }

    @Post("register")
    @ApiCreatedResponse({ type: AuthResponseDto, description: "User registered" })
    @ApiBody({ type: RegisterDto })
    @ResponseMessage("User registered successfully")
    async register(
        @Body() userData: RegisterDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { user, accessToken, refreshToken } =
            await this.authService.register(userData);

        setRefreshTokenCookie(res, refreshToken);
        this.logger.info(
            { module: "auth", userId: user.userId },
            "User registered"
        );

        return { user, accessToken };
    }

    @Post("login")
    @ApiOkResponse({ type: AuthResponseDto, description: "Login successful" })
    @ApiBody({ type: LoginDto })
    @ResponseMessage("Login successful")
    async login(
        @Body() loginData: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { user, accessToken, refreshToken } =
            await this.authService.login(loginData);

        setRefreshTokenCookie(res, refreshToken);
        this.logger.info(
            { module: "auth", userId: user.userId },
            "User logged in"
        );

        return { user, accessToken };
    }

    @Post("refresh")
    @ApiOkResponse({ type: AuthResponseDto, description: "Token refreshed" })
    @ResponseMessage("Token refreshed successfully")
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            throw new HttpApiException({
                status: HttpStatus.UNAUTHORIZED,
                message: "Refresh token required",
                code: "REFRESH_TOKEN_REQUIRED",
            });
        }

        const { user, accessToken, refreshToken: newRefreshToken } =
            await this.authService.refreshAccessToken(refreshToken);

        setRefreshTokenCookie(res, newRefreshToken);
        this.logger.info(
            { module: "auth", userId: user.userId },
            "Issued refreshed access token"
        );

        return { user, accessToken };
    }

    @Post("logout")
    @ApiOkResponse({ type: EmptyResponseDto })
    @ResponseMessage("Logout successful")
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        clearRefreshTokenCookie(res);
        this.logger.info({ module: "auth", action: "logout" }, "User logged out");

        return null;
    }

    @Post("revoke")
    @ApiOkResponse({ type: EmptyResponseDto })
    @ResponseMessage("Token revoked successfully")
    async revokeToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new HttpApiException({
                status: HttpStatus.UNAUTHORIZED,
                message: "Refresh token required",
                code: "REFRESH_TOKEN_REQUIRED",
            });
        }

        await this.authService.revokeRefreshToken(refreshToken);
        clearRefreshTokenCookie(res);
        this.logger.info(
            { module: "auth", action: "revoke_refresh_token" },
            "Refresh token revoked"
        );

        return null;
    }

    @Get("me")
    @ApiBearerAuth()
    @ApiOkResponse({ type: CurrentUserResponseDto })
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@CurrentUser() user?: AuthUser) {
        if (!user) {
            throw new HttpApiException({
                status: HttpStatus.UNAUTHORIZED,
                message: "Unauthorized",
                code: "UNAUTHORIZED",
            });
        }
        const profile = await this.authService.getUserById(user.userId);
        this.logger.info({ module: "auth", userId: user.userId }, "Fetched current user");
        return profile;
    }
}
