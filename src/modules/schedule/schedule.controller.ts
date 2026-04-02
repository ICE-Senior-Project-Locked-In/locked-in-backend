import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import { SkipResponseWrapper } from "@/common/http/decorators/skip-response.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { ScheduleResponseDto, ScheduleListResponseDto, CreateScheduleDto, UpdateScheduleDto } from "./dto/schedule.dto";
import { ScheduleService } from "./schedule.service";

@ApiTags("Schedule")
@Controller({ path: "schedule", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ScheduleController {
    constructor(
        private readonly scheduleService: ScheduleService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(ScheduleController.name);
    }

    @Get()
    @ApiOkResponse({ type: ScheduleListResponseDto, description: "Retrieve the user's focus schedules" })
    async listSchedules(
        @CurrentUser() user: AuthUser
    ) {
        return this.scheduleService.listByUserId(user.userId);
    }

    @Post()
    @ApiOkResponse({ type: ScheduleResponseDto, description: "Create a focus schedule for the user" })
    @ApiBody({ type: CreateScheduleDto })
    async createSchedule(
        @Body() data: CreateScheduleDto,
        @CurrentUser() user: AuthUser
    ) {
        this.logger.info(
            { module: "schedule", userId: user.userId, scheduleData: data },
            "Creating focus schedule for user"
        );
        return this.scheduleService.create(user.userId, data);
    }

    @Put(":scheduleId")
    @ApiOkResponse({ type: ScheduleResponseDto, description: "Update the user's focus schedule" })
    @ApiBody({ type: UpdateScheduleDto })
    async updateSchedule(
        @Body() data: UpdateScheduleDto,
        @CurrentUser() user: AuthUser,
        @Param("scheduleId") scheduleId: string
    ) {
        this.logger.info(
            { module: "schedule", userId: user.userId, scheduleId, scheduleData: data },
            "Updating focus schedule for user"
        );
        return this.scheduleService.update(user.userId, scheduleId, data);
    }

    @Delete(":scheduleId")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: "Delete the user's focus schedule" })
    @SkipResponseWrapper()
    async deleteSchedule(
        @CurrentUser() user: AuthUser,
        @Param("scheduleId") scheduleId: string
    ) {
        this.logger.info(
            { module: "schedule", userId: user.userId, scheduleId },
            "Deleting focus schedule for user"
        );
        return this.scheduleService.delete(user.userId, scheduleId);
    }
}