import { Module } from '@nestjs/common';
import { AtStrategy, RtStrategy, Jwt2faStrategy } from '../strategies';
import { JwtModule } from '@nestjs/jwt';
import { AuthGoogleService } from './auth.google.service';
import { AuthGoogleController } from './auth.google.controller';
import { UserService } from '../../user/user.service';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { AuthLocalService } from '../local/auth.local.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REGISTER_SECRET,
      signOptions: { expiresIn: 60 },
    }),
    MulterModule.register({ dest: './uploads' }),
    HttpModule,
  ],
  controllers: [AuthGoogleController],
  providers: [
    AuthGoogleService,
    UserService,
    AtStrategy,
    RtStrategy,
    Jwt2faStrategy,
    AuthLocalService,
  ],
  exports: [AuthGoogleService, JwtModule, HttpModule],
})
export class AuthGoogleModule {}
