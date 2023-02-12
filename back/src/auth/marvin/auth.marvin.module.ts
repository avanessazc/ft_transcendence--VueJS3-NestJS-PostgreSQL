import { Module } from '@nestjs/common';
import { AtStrategy, RtStrategy, Jwt2faStrategy } from '../strategies';
import { JwtModule } from '@nestjs/jwt';
import { AuthGoogleService } from '../google/auth.google.service';
import { AuthMarvinController } from './auth.marvin.controller';
import { UserService } from '../../user/user.service';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { AuthLocalService } from '../local/auth.local.service';
import { AuthMarvinService } from './auth.marvin.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REGISTER_SECRET,
      signOptions: { expiresIn: 60 },
    }),
    MulterModule.register({ dest: './uploads' }),
    HttpModule,
  ],
  controllers: [AuthMarvinController],
  providers: [
    AuthMarvinService,
    UserService,
    AtStrategy,
    RtStrategy,
    Jwt2faStrategy,
    AuthLocalService,
    AuthGoogleService,
  ],
  exports: [AuthMarvinService, JwtModule, HttpModule],
})
export class AuthMarvinModule {}
