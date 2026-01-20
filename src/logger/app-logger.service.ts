import { ConsoleLogger, Injectable, LoggerService } from "@nestjs/common";
import pino from "pino";
import { config } from "@/config/env";

@Injectable()
export class AppLogger extends ConsoleLogger implements LoggerService {
  private readonly pinoLogger: pino.Logger;
  private static readonly DEFAULT_CONTEXT = AppLogger.name;

  constructor() {
    super();

    this.pinoLogger = pino(
      {
        level: config.logLevel,
        base: { env: config.env },
        redact: {
          paths: [],
          remove: true,
        },
      }
    );
  }

  private resolveContext(context?: string) {
    return context ?? AppLogger.DEFAULT_CONTEXT;
  }

  info(meta: Record<string, unknown>, message: string, context?: string) {
    super.log(message, this.resolveContext(context));
    this.pinoLogger.info(meta ?? {}, message);
  }

  warn(meta: Record<string, unknown>, message: string, context?: string) {
    super.warn(message, this.resolveContext(context));
    this.pinoLogger.warn(meta ?? {}, message);
  }

  error(
    meta: Record<string, unknown>,
    message: string,
    context?: string,
    stack?: string
  ) {
    super.error(message, stack, this.resolveContext(context));
    this.pinoLogger.error(meta ? { ...meta, stack } : { stack }, message);
  }

  debug(meta: Record<string, unknown>, message: string, context?: string) {
    super.debug(message, this.resolveContext(context));
    this.pinoLogger.debug(meta ?? {}, message);
  }

  getPino() {
    return this.pinoLogger;
  }
}
