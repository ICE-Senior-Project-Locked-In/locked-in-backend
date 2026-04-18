import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import { SkipResponseWrapper } from "@/common/http/decorators/skip-response.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import {
    FocusModeResponseDto,
    FocusModeListResponseDto,
    CreateFocusModeDto,
    UpdateFocusModeDto,
    FocusModeIdParamsDto,
} from "./dto/focus-mode.dto";
import { FocusModeService } from "./focus-mode.service";

@ApiTags("FocusMode")
@Controller({ path: "focus-mode", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FocusModeController {
    constructor(
        private readonly focusModeService: FocusModeService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(FocusModeController.name);
    }

    @Get()
    @ApiOkResponse({ type: FocusModeListResponseDto, description: "Retrieve the current user's focus modes" })
    async getFocusModes(
        @CurrentUser() user: AuthUser
    ) {
        return this.focusModeService.getFocusModes(user.userId);
    }

    @Post()
    @ApiOkResponse({ type: FocusModeResponseDto, description: "Create a new focus mode" })
    @ApiBody({ type: CreateFocusModeDto })
    async createFocusMode(
        @Body() data: CreateFocusModeDto,
        @CurrentUser() user: AuthUser
    ) {
        this.logger.info(
            { module: "focus-mode", userId: user.userId, title: data.title },
            "Creating new focus mode"
        );
        return this.focusModeService.createFocusMode(user.userId, data);
    }

    @Put(":modeId")
    @ApiOkResponse({ type: FocusModeResponseDto, description: "Update a focus mode" })
    @ApiBody({ type: UpdateFocusModeDto })
    async updateFocusMode(
        @Param() params: FocusModeIdParamsDto,
        @Body() data: UpdateFocusModeDto,
        @CurrentUser() user: AuthUser
    ) {
        this.logger.info(
            { module: "focus-mode", userId: user.userId, modeId: params.modeId },
            "Updating focus mode"
        );
        return this.focusModeService.updateFocusMode(user.userId, params.modeId, data);
    }

    @Delete(":modeId")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: "Delete a focus mode" })
    @SkipResponseWrapper()
    async deleteFocusMode(
        @Param() params: FocusModeIdParamsDto,
        @CurrentUser() user: AuthUser
    ) {
        this.logger.info(
            { module: "focus-mode", userId: user.userId, modeId: params.modeId },
            "Deleting focus mode"
        );
        await this.focusModeService.deleteFocusMode(user.userId, params.modeId);
    }
}
