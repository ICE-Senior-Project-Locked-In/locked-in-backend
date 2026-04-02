import { Controller, Get, Post, Put, Delete, Body, UseGuards, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import { SkipResponseWrapper } from "@/common/http/decorators/skip-response.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { PetResponseDto, CreatePetDto, UpdatePetDto } from "./dto/pet.dto";
import { PetService } from "./pet.service";

@ApiTags("Pet")
@Controller({ path: "pet", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PetController {
    constructor(
        private readonly petService: PetService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(PetController.name);
    }

    @Get()
    @ApiOkResponse({ type: PetResponseDto, description: "Retrieve the user's pet" })
    async getPet(
        @CurrentUser() user: AuthUser
    ) {
        return this.petService.findByOwnerId(user.userId);
    }

    @Post()
    @ApiOkResponse({ type: PetResponseDto, description: "Create a pet for the user" })
    @ApiBody({ type: CreatePetDto })
    async createPet(
        @Body() data: CreatePetDto,
        @CurrentUser() user: AuthUser
    ) {
        const { name, type } = data;
        this.logger.info(
            { module: "pet", userId: user.userId, petName: name, petType: type },
            "Creating pet for user"
        );
        return this.petService.create(user.userId, name, type);
    }

    @Put()
    @ApiOkResponse({ type: PetResponseDto, description: "Update the user's pet" })
    @ApiBody({ type: UpdatePetDto })
    async updatePet(
        @Body() data: UpdatePetDto,
        @CurrentUser() user: AuthUser
    ) {
        const { name, type, xp } = data;
        this.logger.info(
            { module: "pet", userId: user.userId, petName: name, petType: type, petXp: xp },
            "Updating pet for user"
        );
        return this.petService.update(user.userId, name, type, xp);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: "Delete the user's pet" })
    @SkipResponseWrapper()
    async deletePet(
        @CurrentUser() user: AuthUser
    ) {
        await this.petService.delete(user.userId);
    }
}