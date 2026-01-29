import { Module } from '@nestjs/common';
import { NFCService } from './nfc.service';
import { NFCController } from './nfc.controller';

@Module({
    controllers: [NFCController],
    providers: [NFCService],
})
export class NFCModule { }
