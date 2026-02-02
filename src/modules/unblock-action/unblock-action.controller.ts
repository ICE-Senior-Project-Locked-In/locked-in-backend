import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import { SkipResponseWrapper } from "@/common/http/decorators/skip-response.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import {
    UnblockActionResponseDto,
    UnblockActionListResponseDto,
    UserUnblockActionResponseDto,
    UserUnblockActionListResponseDto,
    CreateUnblockActionDto,
    CreateUserUnblockActionDto,
    DeleteUserUnblockActionParamsDto,
} from "./dto/unblock-action.dto";
import { UnblockActionService } from "./unblock-action.service";

@ApiTags("UnblockAction")
@Controller({ path: "unblock-action", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UnblockActionController {
    constructor(
        private readonly unblockActionService: UnblockActionService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(UnblockActionController.name);
    }

    @Get()
    @ApiOkResponse({ type: UnblockActionListResponseDto, description: "Retrieve all unblock actions" })
    async getAllUnblockActions() {
        return this.unblockActionService.getAllUnblockActions();
    }

    @Get("default")
    @ApiOkResponse({ type: UnblockActionListResponseDto, description: "Retrieve the default unblock actions" })
    async getDefaultUnblockActions() {
        return this.unblockActionService.getDefaultUnblockActions();
    }

    @Get("me")
    @ApiOkResponse({ type: UserUnblockActionListResponseDto, description: "Retrieve the current user's unblock actions" })
    async getUserUnblockActions(
        @CurrentUser() user: AuthUser
    ) {
        return this.unblockActionService.getUserUnblockActions(user.userId);
    }

    @Post()
    @ApiOkResponse({ type: UnblockActionResponseDto, description: "Create a new unblock action" })
    @ApiBody({ type: CreateUnblockActionDto })
    async createUnblockAction(
        @Body() data: CreateUnblockActionDto,
        @CurrentUser() user: AuthUser
    ) {
        const { name } = data;
        this.logger.info(
            { module: "unblock-action", userId: user.userId, unblockActionName: name },
            "Creating new unblock action"
        );
        return this.unblockActionService.createUnblockAction(name);
    }

    @Post("me")
    @ApiOkResponse({ type: UserUnblockActionResponseDto, description: "Create a new user unblock action" })
    @ApiBody({ type: CreateUserUnblockActionDto })
    async createUserUnblockAction(
        @Body() data: CreateUserUnblockActionDto,
        @CurrentUser() user: AuthUser
    ) {
        const { actionId } = data;
        this.logger.info(
            { module: "unblock-action", userId: user.userId, unblockActionId: actionId },
            "Creating new user unblock action"
        );
        return this.unblockActionService.createUserUnblockAction(user.userId, actionId);
    }

    @Delete("me/:actionId")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: "Delete a user unblock action" })
    @SkipResponseWrapper()
    async deleteUserUnblockAction(
        @Param() params: DeleteUserUnblockActionParamsDto,
        @CurrentUser() user: AuthUser
    ) {
        const { actionId } = params;
        this.logger.info(
            { module: "unblock-action", userId: user.userId, unblockActionId: actionId },
            "Deleting user unblock action"
        );
        return this.unblockActionService.deleteUserUnblockAction(user.userId, actionId);
    }
}