import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REGISTER_SECRET,
      signOptions: { expiresIn: 3600 },
    }),
    HttpModule,
  ],
  controllers: [PongController],
  providers: [PongService, PongGateway, UserService],
  exports: [PongService],
})
export class PongModule {}
