import { Module } from '@nestjs/common';
import { FocusTypeService } from './focus-type.service';
import { FocusTypeController } from './focus-type.controller';

@Module({
    controllers: [FocusTypeController],
    providers: [FocusTypeService],
})
export class FocusTypeModule { }
