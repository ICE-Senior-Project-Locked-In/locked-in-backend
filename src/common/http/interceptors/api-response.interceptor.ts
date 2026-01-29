import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Response } from "express";
import { map } from "rxjs/operators";
import {
    RESPONSE_MESSAGE_METADATA_KEY,
    SKIP_RESPONSE_WRAPPER_METADATA_KEY,
} from "@/common/constants/metadata-keys";

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler) {
        const skip =
            this.reflector.getAllAndOverride<boolean>(
                SKIP_RESPONSE_WRAPPER_METADATA_KEY,
                [context.getHandler(), context.getClass()]
            ) ?? false;

        if (skip) {
            return next.handle();
        }

        const message =
            this.reflector.getAllAndOverride<string | null>(
                RESPONSE_MESSAGE_METADATA_KEY,
                [context.getHandler(), context.getClass()]
            ) ?? null;

        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse<Response>();

        return next.handle().pipe(
            map((data) => ({
                success: response.statusCode >= 200 && response.statusCode < 300,
                message,
                data: data ?? null,
                timestamp: new Date().toISOString(),
            }))
        );
    }
}
