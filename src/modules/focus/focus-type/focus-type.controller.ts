import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import { SkipResponseWrapper } from "@/common/http/decorators/skip-response.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import {
    FocusTypeResponseDto,
    FocusTypeListResponseDto,
    UserFocusTypeResponseDto,
    UserFocusTypeListResponseDto,
    CreateFocusTypeDto,
    CreateUserFocusTypeDto,
    DeleteUserFocusTypeParamsDto,
} from "./dto/focus-type.dto";
import { FocusTypeService } from "./focus-type.service";

@ApiTags("FocusType")
@Controller({ path: "focus-type", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FocusTypeController {
    constructor(
        private readonly focusTypeService: FocusTypeService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(FocusTypeController.name);
    }

    @Get()
    @ApiOkResponse({ type: FocusTypeListResponseDto, description: "Retrieve all focus types" })
    async getAllFocusTypes() {
        return this.focusTypeService.getAllFocusTypes();
    }

    @Get("default")
    @ApiOkResponse({ type: FocusTypeListResponseDto, description: "Retrieve the default focus type" })
    async getDefaultFocusTypes() {
        return this.focusTypeService.getDefaultFocusTypes();
    }

    @Get("me")
    @ApiOkResponse({ type: UserFocusTypeListResponseDto, description: "Retrieve the current user's focus types" })
    async getUserFocusTypes(
        @CurrentUser() user: AuthUser
    ) {
        return this.focusTypeService.getUserFocusTypes(user.userId);
    }

    @Post()
    @ApiOkResponse({ type: FocusTypeResponseDto, description: "Create a new focus type" })
    @ApiBody({ type: CreateFocusTypeDto })
    async createFocusType(
        @Body() data: CreateFocusTypeDto,
        @CurrentUser() user: AuthUser
    ) {
        const { name } = data;
        this.logger.info(
            { module: "focus-type", userId: user.userId, focusTypeName: name },
            "Creating new focus type"
        );
        return this.focusTypeService.createFocusType(name);
    }

    @Post("me")
    @ApiOkResponse({ type: UserFocusTypeResponseDto, description: "Create a new user focus type" })
    @ApiBody({ type: CreateUserFocusTypeDto })
    async createUserFocusType(
        @Body() data: CreateUserFocusTypeDto,
        @CurrentUser() user: AuthUser
    ) {
        const { typeId } = data;
        this.logger.info(
            { module: "focus-type", userId: user.userId, focusTypeId: typeId },
            "Creating new user focus type"
        );
        return this.focusTypeService.createUserFocusType(user.userId, typeId);
    }

    @Delete("me/:typeId")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: "Delete a user focus type" })
    @SkipResponseWrapper()
    async deleteUserFocusType(
        @Param() params: DeleteUserFocusTypeParamsDto,
        @CurrentUser() user: AuthUser,
    ) {
        const { typeId } = params;
        this.logger.info(
            { module: "focus-type", userId: user.userId, focusTypeId: typeId },
            "Deleting user focus type"
        );
        await this.focusTypeService.deleteUserFocusType(user.userId, typeId);
    }
}