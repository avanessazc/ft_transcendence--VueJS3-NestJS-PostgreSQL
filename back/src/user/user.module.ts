import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthLocalService } from '../auth/local/auth.local.service';
import { AuthLocalController } from '../auth/local/auth.local.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_REGISTER_SECRET,
      signOptions: { expiresIn: 60 },
    }),
    HttpModule,
  ],
  controllers: [UserController, AuthLocalController],
  providers: [UserService, AuthLocalService, HttpModule],
  exports: [HttpModule],
})
export class UserModule {}
