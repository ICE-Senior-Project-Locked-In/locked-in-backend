import { Module } from '@nestjs/common';
import { FocusModeService } from './focus-mode.service';
import { FocusModeController } from './focus-mode.controller';

@Module({
    controllers: [FocusModeController],
    providers: [FocusModeService],
    exports: [FocusModeService],
})
export class FocusModeModule { }
