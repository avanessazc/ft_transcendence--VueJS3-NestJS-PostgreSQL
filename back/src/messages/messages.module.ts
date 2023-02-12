import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { HttpModule } from '@nestjs/axios';
import { MessagesController } from './messages.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PongService } from '../pong/pong.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { FriendshipModule } from '../friendship/friendship.module';
import { FriendshipService } from '../friendship/friendship.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REGISTER_SECRET,
      signOptions: { expiresIn: 3600 },
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    UserModule,
    FriendshipModule,
  ],
  controllers: [MessagesController],
  providers: [
    MessagesGateway,
    MessagesService,
    PongService,
    UserService,
    FriendshipService,
  ],
  exports: [HttpModule, MessagesService],
})
export class MessagesModule {}
