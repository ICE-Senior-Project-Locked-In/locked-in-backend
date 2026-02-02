import { Module } from '@nestjs/common';
import { FocusLogService } from './focus-log.service';
import { FocusLogController } from './focus-log.controller';

@Module({
    controllers: [FocusLogController],
    providers: [FocusLogService],
})
export class FocusLogModule { }
