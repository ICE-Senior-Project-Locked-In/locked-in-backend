import { Module } from "@nestjs/common";
import { UnblockActionService } from "./unblock-action.service";
import { UnblockActionController } from "./unblock-action.controller";

@Module({
    controllers: [UnblockActionController],
    providers: [UnblockActionService],
    exports: [UnblockActionService],
})
export class UnblockActionModule { }