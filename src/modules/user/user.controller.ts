import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { PaginationHelper, PaginatedResponse } from "@/common/helper/pagination.helper";
import { UserService } from "./user.service";
import {
    UserResponseDto,
    UserListResponseDto,
    UserFiltersDto,
    UserIdParamDto,
} from "./dto/user.dto";
import { User } from "@prisma/client";

@ApiTags("User")
@Controller({ path: "user", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(UserController.name);
    }

    @Get()
    @ApiOkResponse({ type: UserListResponseDto, description: "Retrieve all users" })
    async getAllUsers(
        @Query() query: UserFiltersDto,
        @CurrentUser() user: AuthUser
    ): Promise<PaginatedResponse<User>> {
        const pagination = PaginationHelper.getOptions(query);
        return this.userService.getUsers(user.userId, query, pagination);
    }

    @Get(":userId")
    @ApiOkResponse({ type: UserResponseDto, description: "Retrieve user by ID" })
    async getUserById(
        @Param() params: UserIdParamDto
    ): Promise<User | null> {
        const { userId } = params;
        return this.userService.getUserById(userId);
    }
}