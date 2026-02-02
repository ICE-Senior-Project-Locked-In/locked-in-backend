import { Controller, Get, Post, Put, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { FocusLogService } from "./focus-log.service";
import { FocusLogResponseDto, FocusLogListResponseDto, FocusLogIdParamsDto, StartFocusLogDto, EndFocusLogDto } from "./dto/focus-log.dto";

@ApiTags("FocusLog")
@Controller({ path: "focus-log", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FocusLogController {
    constructor(
        private readonly focusLogService: FocusLogService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(FocusLogController.name);
    }

    @Get("me")
    @ApiOkResponse({ type: FocusLogListResponseDto, description: "Retrieve the current user's focus logs" })
    async getUserFocusLogs(
        @CurrentUser() user: AuthUser
    ) {
        return this.focusLogService.getFocusLogsByUserId(user.userId);
    }

    @Get("me/active")
    @ApiOkResponse({ type: FocusLogResponseDto, description: "Retrieve the current user's active focus log" })
    async getActiveUserFocusLog(
        @CurrentUser() user: AuthUser
    ) {
        return this.focusLogService.getActiveFocusLogByUserId(user.userId);
    }

    @Post("me/start")
    @ApiOkResponse({ type: FocusLogResponseDto, description: "Start a new focus log for the current user" })
    @ApiBody({ type: StartFocusLogDto })
    async startUserFocusLog(
        @Body() data: StartFocusLogDto,
        @CurrentUser() user: AuthUser
    ) {
        const { typeId, startTime } = data;
        this.logger.info(
            { module: "focus-log", userId: user.userId, focusTypeId: typeId },
            "Starting new focus log"
        );
        return this.focusLogService.startFocusLog(user.userId, typeId, startTime);
    }

    @Put("me/:logId/end")
    @ApiOkResponse({ type: FocusLogResponseDto, description: "End the current user's focus log" })
    @ApiBody({ type: EndFocusLogDto })
    async endUserFocusLog(
        @Param() params: FocusLogIdParamsDto,
        @Body() data: EndFocusLogDto,
        @CurrentUser() user: AuthUser
    ) {
        const { logId } = params;
        const { endTime } = data;
        this.logger.info(
            { module: "focus-log", userId: user.userId, focusLogId: logId },
            "Ending focus log"
        );
        return this.focusLogService.endFocusLog(user.userId, logId, endTime);
    }
}