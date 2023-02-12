import { Module } from '@nestjs/common';
import { AtStrategy, RtStrategy, Jwt2faStrategy } from '../strategies';
import { JwtModule } from '@nestjs/jwt';
import { AuthLocalService } from './auth.local.service';
import { AuthLocalController } from './auth.local.controller';
import { UserService } from '../../user/user.service';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REGISTER_SECRET,
      signOptions: { expiresIn: 60 },
    }),
    MulterModule.register({ dest: './uploads' }),
    HttpModule,
  ],
  controllers: [AuthLocalController],
  providers: [
    AuthLocalService,
    UserService,
    AtStrategy,
    RtStrategy,
    Jwt2faStrategy,
  ],
  exports: [AuthLocalService, JwtModule, HttpModule],
})
export class AuthLocalModule {}
