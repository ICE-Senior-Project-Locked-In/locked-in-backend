import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { NFCModule } from './modules/nfc/nfc.module';
import { FocusTypeModule } from './modules/focus/focus-type/focus-type.module';
import { FocusLogModule } from './modules/focus/focus-log/focus-log.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    NFCModule,
    FocusTypeModule,
    FocusLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
