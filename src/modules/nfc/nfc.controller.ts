import { Controller, Post, Delete, Body, UseGuards, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { AppLogger } from "@/logger/app-logger.service";
import { JwtAuthGuard } from "@/common/http/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/http/decorators/current-user.decorator";
import { SkipResponseWrapper } from "@/common/http/decorators/skip-response.decorator";
import type { AuthUser } from "@/common/interfaces/auth-user.interface";
import { PairNFCDto } from "./dto/nfc.dto";
import { NFCService } from "./nfc.service";

@ApiTags("NFC")
@Controller({ path: "nfc", version: "1" })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NFCController {
    constructor(
        private readonly nfcService: NFCService,
        private readonly logger: AppLogger
    ) {
        this.logger.setContext(NFCController.name);
    }

    @Post()
    @ApiOkResponse({ type: PairNFCDto, description: "NFC Pairing successful" })
    @ApiBody({ type: PairNFCDto })
    async pair(
        @Body() data: PairNFCDto,
        @CurrentUser() user: AuthUser,
    ) {
        const pair = this.nfcService.pair(user.userId, data);
        this.logger.info(
            { module: "nfc", userId: user.userId, serialNumber: data.serialNumber },
            "NFC pairing successful"
        );
        return pair;
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @SkipResponseWrapper()
    async unpair(
        @CurrentUser() user: AuthUser
    ) {
        await this.nfcService.unpair(user.userId);
        this.logger.info(
            { module: "nfc", userId: user.userId },
            "NFC unpaired"
        );
    }
}