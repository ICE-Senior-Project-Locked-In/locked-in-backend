import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { config } from "@/config/env";
import jwt from "jsonwebtoken";
import type { Request } from "express";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context
            .switchToHttp()
            .getRequest<Request & { user?: AuthUser }>();

        const authHeader = request.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedException("Access token required");
        }

        if (!config.jwtSecret) {
            throw new UnauthorizedException("JWT secret not configured");
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            if (
                typeof decoded === "object" &&
                decoded !== null &&
                "userId" in decoded &&
                "email" in decoded
            ) {
                request.user = {
                    userId: decoded.userId as string,
                    email: decoded.email as string,
                };
                return true;
            }
            throw new UnauthorizedException("Invalid token payload");
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedException("Access token expired");
            }
            throw new UnauthorizedException("Invalid access token");
        }
    }
}
