import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserController } from './user/user.controller';
import { AppService } from './app.service';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';
import { AuthLocalService } from './auth/local/auth.local.service';
import { AuthLocalController } from './auth/local/auth.local.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthLocalModule } from './auth/local/auth.local.module';
import { MulterModule } from '@nestjs/platform-express';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { MessagesModule } from './messages/messages.module';
import { FriendshipModule } from './friendship/friendship.module';
import { AuthGoogleModule } from './auth/google/auth.google.module';
import { AuthMarvinModule } from './auth/marvin/auth.marvin.module';
import { PongService } from './pong/pong.service';
import { PongController } from './pong/pong.controller';
import { PongModule } from './pong/pong.module';
import { PrivateChanInvitationModule } from './privateChanInvitation/privateChanInvitation.module';
import { PrivateChanInvitationController } from './privateChanInvitation/privateChanInvitation.controller';
import { PrivateChanInvitationService } from './privateChanInvitation/privateChanInvitation.service';
import { AchievementsController } from './achievements/achievements.controller';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthLocalModule,
    AuthGoogleModule,
    AuthMarvinModule,
    UserModule,
    MulterModule.register({ dest: './uploads' }),
    MessagesModule,
    FriendshipModule,
    PongModule,
    PrivateChanInvitationModule,
    AchievementsModule,
  ],
  controllers: [
    AppController,
    AuthLocalController,
    UserController,
    PongController,
    PrivateChanInvitationController,
    AchievementsController,
  ],
  providers: [
    AppService,
    GoogleStrategy,
    AuthLocalService,
    UserService,
    PongService,
    PrivateChanInvitationService,
    AchievementsService,
  ],
})
export class AppModule {}
