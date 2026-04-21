import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { ItemListResponseDto, ListItemsQueryDto } from "./dto/item.dto";
import { ItemService } from "./item.service";

@ApiTags("Item")
@Controller({ path: "item", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Get()
    @ApiOkResponse({ type: ItemListResponseDto, description: "Retrieve all items" })
    listItems(@Query() query: ListItemsQueryDto) {
        return this.itemService.listItems(query.type);
    }
}
