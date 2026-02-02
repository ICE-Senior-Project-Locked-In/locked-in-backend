import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { FriendModule } from './modules/friend/friend.module';
import { NFCModule } from './modules/nfc/nfc.module';
import { FocusTypeModule } from './modules/focus/focus-type/focus-type.module';
import { FocusLogModule } from './modules/focus/focus-log/focus-log.module';
import { UnblockActionModule } from './modules/unblock-action/unblock-action.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    FriendModule,
    NFCModule,
    FocusTypeModule,
    FocusLogModule,
    UnblockActionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
