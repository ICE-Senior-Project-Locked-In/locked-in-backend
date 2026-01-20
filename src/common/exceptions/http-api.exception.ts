import { HttpException, type HttpStatus } from "@nestjs/common";

export interface HttpApiExceptionOptions {
    status: HttpStatus;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    cause?: Error;
}

export class HttpApiException extends HttpException {
    readonly code: string;
    readonly details?: Record<string, unknown>;

    constructor(options: HttpApiExceptionOptions) {
        const responseBody = {
            message: options.message,
            code: options.code ?? "UNHANDLED_ERROR",
            details: options.details ?? null,
        };

        super(responseBody, options.status, { cause: options.cause });
        this.code = responseBody.code;
        this.details = responseBody.details ?? undefined;
    }
}
