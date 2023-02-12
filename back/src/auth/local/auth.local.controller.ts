import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLocalService } from './auth.local.service';
import { AuthDto } from '../dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Request } from 'express';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { error_codes } from '../../errors';

@Controller('local/auth')
export class AuthLocalController {
  constructor(
    private authLocalService: AuthLocalService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './files',
        filename: async (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extArray = file.mimetype.split('/');
          const extension = extArray[extArray.length - 1];
          const filename = `avatar-${uniqueSuffix}.${extension}`;
          return callback(null, filename);
        },
      }),
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(
    @Body() dto: AuthDto,
    @UploadedFile() avatar: Express.Multer.File,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      if (avatar !== undefined) {
        const real_typemime: string =
          await this.authLocalService.analyzeTypemime(
            './files/' + avatar.filename,
          );
        if (real_typemime !== 'png' && real_typemime !== 'jpg') {
          fs.unlink('./files/' + avatar.filename, (err) => {
            if (err) console.log('unlink avatar.filename');
          });
          return error_codes[3];
        }
        dto.avatar = 'http://localhost:3000/files/' + avatar.filename;
      } else {
        dto.avatar = 'http://localhost:3000/files/defaultAvatar.jpeg';
      }
      return await this.authLocalService.signupLocal(dto, response);
    } catch (e) {
      console.log('signupLocal');
      return error_codes[3];
    }
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signinLocal(
    @Body() dto: Partial<AuthDto>,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    return await this.authLocalService.signinLocal(dto, res, refreshToken);
  }

  @Post('check-credentials')
  @HttpCode(HttpStatus.OK)
  async checkCredentials(
    @Body() dto: Partial<AuthDto>,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authLocalService.checkCredentials(dto, res);
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      req.cookies['access_token'];
      response.clearCookie('refresh_token');
      response.clearCookie('access_token');
      return await this.authLocalService.logout(refreshToken);
    } catch (e) {
      console.log('logout');
    }
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      if (req.cookies['refresh_token']) {
        const refreshToken = req.cookies['refresh_token'];
        const { sub, email, two_factor_enabled, isTwoFactorAuthOK } =
          await this.jwtService.verifyAsync(refreshToken, {
            secret: process.env.JWT_RT_SECRET,
          });
        return await this.authLocalService.refreshTokens(
          sub,
          email,
          two_factor_enabled,
          isTwoFactorAuthOK,
          refreshToken,
          response,
        );
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  // We can only turn-on 2FA after generating the secret and QRCode
  // To be sure of that we require the user to provide the 2FA Code
  // (we are thus 100% sure he has made the right setup)
  // In parallel we continue to check the JWT Access Token to be sure
  // that the user is logged in.
  @Post('2fa/turn-on')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async turnOnTwoFactorAuthentication(@Req() request, @Body() body) {
    try {
      const two_factor_auth_secret =
        await this.authLocalService.get2FactorAuthSecret(request.user['sub']);
      if (!two_factor_auth_secret || !two_factor_auth_secret.trim()) {
        throw new UnauthorizedException(
          'Error: Empty 2FA Auth Secret: Before being able to activate the 2-factor Authentication, you first need to generate a QR code and scan it with your Google Authenticator app.',
        );
      }
      if (!body.twoFactorAuthCode || !body.twoFactorAuthCode.trim()) {
        throw new UnauthorizedException('Error: Empty Authentication Code');
      }
      const isCodeValid = await this.authLocalService.isTwoFactorAuthCodeValid(
        body.twoFactorAuthCode,
        request.user['sub'],
      );
      if (!isCodeValid) {
        throw new UnauthorizedException(
          'Error: Wrong authentication code - you cannot turn on 2FA Authentication',
        );
      }
      await this.authLocalService.turnOnTwoFactorAuth(request.user);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Post('2fa/turn-off')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-2fa'))
  async turnOffTwoFactorAuthentication(@Req() request, @Body() body) {
    const isCodeValid = await this.authLocalService.isTwoFactorAuthCodeValid(
      body.twoFactorAuthCode,
      request.user['sub'],
    );
    if (!isCodeValid) {
      throw new UnauthorizedException(
        'Error: Wrong authentication code - you cannot turn off 2FA Authentication',
      );
    }
    await this.authLocalService.turnOffTwoFactorAuth(request.user);
  }

  @Post('2fa/generate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  async register(@Res({ passthrough: true }) response, @Req() request) {
    const { otpAuthUrl } =
      await this.authLocalService.generatetwo_factor_auth_secret(request.user);
    return await this.authLocalService.generateQrCodeDataURL(otpAuthUrl);
  }

  @Post('2fa/authenticate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async authenticate(
    @Req() request,
    @Body() body,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const two_factor_auth_secret =
        await this.authLocalService.get2FactorAuthSecret(request.user['sub']);

      if (!two_factor_auth_secret || !two_factor_auth_secret.trim()) {
        throw new UnauthorizedException(
          'Error: Empty 2FA Auth Secret: Before being able to activate the 2-factor Authentication, you first need to generate a QR code and scan it with your Google Authenticator app.',
        );
      }

      if (!body.twoFactorAuthCode || !body.twoFactorAuthCode.trim()) {
        throw new UnauthorizedException('Error: Empty Authentication Code');
      }

      if (request.user['two_factor_enabled'] == false)
        return 'Wrong Route: 2FA is not enabled for this user.';

      const isCodeValid = await this.authLocalService.isTwoFactorAuthCodeValid(
        body.twoFactorAuthCode,
        request.user['sub'],
      );
      if (!isCodeValid) {
        return null;
      }
      return await this.authLocalService.signin2FA(request.user, response);
    } catch (e) {
      console.log('signin2FA');
      return null;
    }
  }
}
