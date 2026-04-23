import { Controller, Get, Post, Put, Delete, Query, Param, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { SkipResponseWrapper } from "@/common/http/decorators/skip-response.decorator";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { PaginationHelper, PaginatedResponse } from "@/common/helper/pagination.helper";
import { FriendService } from "./friend.service";
import {
    FriendResponseDto,
    FriendFiltersDto,
    FriendshipResponseDto,
    CreateFriendRequestParamsDto,
    UpdateFriendRequestParamsDto,
    UpdateFriendRequestQueryDto,
    DeleteFriendshipParamsDto,
    LeaderboardQueryDto,
    LeaderboardResponseDto,
} from "./dto/friend.dto";
import { LeaderboardEntry } from "@/schemas/friend.schema";
import { User, Friendship } from "@prisma/client";

@ApiTags("Friend")
@Controller({ path: "friend", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FriendController {
    constructor(
        private readonly friendService: FriendService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(FriendController.name);
    }

    @Get("leaderboard")
    @ApiOkResponse({ type: LeaderboardResponseDto, description: "Get friends leaderboard ranked by total focus time" })
    async getLeaderboard(
        @Query() query: LeaderboardQueryDto,
        @CurrentUser() user: AuthUser
    ): Promise<LeaderboardEntry[]> {
        return this.friendService.getLeaderboard(user.userId, query);
    }

    @Get()
    @ApiOkResponse({ type: FriendResponseDto, description: "Retrieve all friends of the current user" })
    async getFriends(
        @Query() query: FriendFiltersDto,
        @CurrentUser() user: AuthUser
    ): Promise<PaginatedResponse<User>> {
        const pagination = PaginationHelper.getOptions(query);
        return this.friendService.getFriends(user.userId, pagination);
    }

    @Get("requests")
    @ApiOkResponse({ type: FriendshipResponseDto, description: "Retrieve pending friend requests for the current user" })
    async getFriendRequests(
        @Query() query: FriendFiltersDto,
        @CurrentUser() user: AuthUser
    ): Promise<PaginatedResponse<Friendship>> {
        const pagination = PaginationHelper.getOptions(query);
        return this.friendService.getFriendRequests(user.userId, pagination);
    }

    @Get("sent-requests")
    @ApiOkResponse({ type: FriendshipResponseDto, description: "Retrieve sent friend requests by the current user" })
    async getSentFriendRequests(
        @Query() query: FriendFiltersDto,
        @CurrentUser() user: AuthUser
    ): Promise<PaginatedResponse<Friendship>> {
        const pagination = PaginationHelper.getOptions(query);

        return this.friendService.getSentFriendRequests(user.userId, pagination);
    }

    @Post("request/:receiverId")
    @ApiOkResponse({ type: FriendshipResponseDto, description: "Send a friend request to another user" })
    async sendFriendRequest(
        @Param() params: CreateFriendRequestParamsDto,
        @CurrentUser() user: AuthUser
    ): Promise<Friendship> {
        const { receiverId } = params;
        return this.friendService.createFriendRequest(user.userId, receiverId);
    }

    @Put("request/:friendshipId")
    @ApiOkResponse({ type: FriendshipResponseDto, description: "Update the status of a friend request" })
    async updateFriendRequest(
        @Param() params: UpdateFriendRequestParamsDto,
        @Query() query: UpdateFriendRequestQueryDto,
        @CurrentUser() user: AuthUser
    ): Promise<Friendship> {
        const { friendshipId } = params;
        const { status } = query;
        return this.friendService.updateFriendRequest(user.userId, friendshipId, status);
    }

    @Delete(":friendshipId")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: "Delete a friendship" })
    @SkipResponseWrapper()
    async deleteFriendship(
        @Param() params: DeleteFriendshipParamsDto,
        @CurrentUser() user: AuthUser,
    ) {
        const { friendshipId } = params;
        this.logger.info(
            { module: "friend", userId: user.userId, friendshipId },
            "Deleting friendship"
        );
        await this.friendService.deleteFriendship(user.userId, friendshipId);
    }
}