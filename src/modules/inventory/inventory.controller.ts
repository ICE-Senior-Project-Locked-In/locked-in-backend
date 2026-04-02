import { Controller, Get, Post, Put, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { InventoryItemResponseDto, InventoryItemListResponseDto, CreateInventoryItemDto, UpdateInventoryItemDto } from "./dto/inventory.dto";
import { InventoryService } from "./inventory.service";

@ApiTags("Inventory")
@Controller({ path: "inventory", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(InventoryController.name);
    }

    @Get()
    @ApiOkResponse({ type: InventoryItemListResponseDto, description: "Retrieve the user's inventory items" })
    async listInventoryItems(
        @CurrentUser() user: AuthUser
    ) {
        return this.inventoryService.listItemsByUserId(user.userId);
    }

    @Post()
    @ApiOkResponse({ type: InventoryItemResponseDto, description: "Add an item to the user's inventory" })
    @ApiBody({ type: CreateInventoryItemDto })
    async createInventoryItem(
        @Body() data: CreateInventoryItemDto,
        @CurrentUser() user: AuthUser
    ) {
        this.logger.info(
            { module: "inventory", userId: user.userId, itemData: data },
            "Adding item to user's inventory"
        );
        return this.inventoryService.createItem(user.userId, data);
    }

    @Put(":itemId")
    @ApiOkResponse({ type: InventoryItemResponseDto, description: "Update an item in the user's inventory" })
    @ApiBody({ type: UpdateInventoryItemDto })
    async updateInventoryItem(
        @Body() data: UpdateInventoryItemDto,
        @CurrentUser() user: AuthUser,
        @Param("itemId") itemId: string
    ) {
        this.logger.info(
            { module: "inventory", userId: user.userId, itemId, itemData: data },
            "Updating item in user's inventory"
        );
        return this.inventoryService.updateItem(user.userId, itemId, data);
    }
}