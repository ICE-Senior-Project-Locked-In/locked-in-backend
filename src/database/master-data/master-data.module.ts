import { Module } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { DatabaseModule } from '../database.module';

@Module({
    imports: [DatabaseModule],
    providers: [MasterDataService],
    exports: [MasterDataService],
})
export class MasterDataModule { }
