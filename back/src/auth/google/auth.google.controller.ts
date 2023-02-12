import { Controller, Req, Res, Get, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLocalService } from '../local/auth.local.service';
import { AuthGoogleService } from './auth.google.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';

@Controller('auth/google')
export class AuthGoogleController {
  constructor(
    private authLocalService: AuthLocalService,
    private authGoogleService: AuthGoogleService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  @Get('')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    console.log('Google oAuth2 Redirection');
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    let refreshToken: string;
    if (req.cookies['refresh_token'])
      refreshToken = req.cookies['refresh_token'];
    else refreshToken = '';
    if (req.user.email.length > 30) {
      res.redirect('http://localhost:8080/google/login/emailtoolong');
      return;
    } else
      return await this.authGoogleService.googleLogin(req, res, refreshToken);
  }
}
