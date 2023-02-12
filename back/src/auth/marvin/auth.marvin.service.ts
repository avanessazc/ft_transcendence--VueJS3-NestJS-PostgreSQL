import { Injectable, UnauthorizedException, Res } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tokens, MarvinUser } from '../types';
import { JwtService } from '@nestjs/jwt';
import { generate } from 'generate-password';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { UserService } from '../../user/user.service';
import { AuthLocalService } from '../local/auth.local.service';
import { AuthGoogleService } from '../google/auth.google.service';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AuthMarvinService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private readonly httpService: HttpService,
    private authLocalService: AuthLocalService,
    private authGoogleService: AuthGoogleService,
  ) {}

  async createNewUserFromMarvin(user: MarvinUser) {
    const password = generate({ length: 20, numbers: true });
    const hash = await this.authLocalService.hashData(password);
    const new_nickname = await this.authGoogleService.generateUniqueNickname(
      user.email,
    );

    user.password = hash;
    user.nickname = new_nickname;
    const new_user = await this.userService.create_new_marvin_user(user);
    await this.userService.create_achievementsPerUser(new_user.id);
    const tmp_file = await this.authGoogleService.download(new_user.avatar);
    const real_typemime: string = await this.authLocalService.analyzeTypemime(
      './files/' + tmp_file,
    );
    await this.authLocalService.renameTmpAvatarFile(
      tmp_file,
      real_typemime,
      new_user.id,
    );
    return new_user;
  }

  async requestMarvinAT(code: string) {
    const params = {
      grant_type: 'authorization_code',
      client_id: process.env.MARVIN_CLIENT_ID,
      client_secret: process.env.MARVIN_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.MARVIN_OAUTH_CALLBACK_URL,
    };

    const data = await lastValueFrom(
      this.httpService.post(process.env.MARVIN_OAUTH_TOKEN_URL, params).pipe(
        map((response) => {
          return response.data;
        }),
      ),
    );
    if (!data) {
      throw new Error(`Request failed`);
    }
    return data.access_token;
  }

  async marvinLogin(
    code: string,
    state: string,
    @Res() res: Response,
    refreshToken: string,
  ) {
    if (!state || state != process.env.MARVIN_OUR_API_STATE) {
      throw new UnauthorizedException('Illegal middleman detection!');
    }

    const response_token_request = await this.requestMarvinAT(code);
    if (!response_token_request) {
      throw new UnauthorizedException('Access Token Error');
    }

    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + response_token_request,
    };

    let user: MarvinUser;
    try {
      const observable_response = await this.httpService.get(
        process.env.MARVIN_API_ME_URL,
        { headers: headersRequest },
      );
      const promise_response = await lastValueFrom(observable_response);
      user = promise_response.data.cursus_users[0].user;
    } catch (e) {
      console.log('marvinLogin');
    }

    if (!user.email) return 'No info about this user';
    const existing_user = await this.userService.find_one_by_email(user.email);
    let tokens: Tokens;
    if (refreshToken) await this.userService.remove_former_rt(refreshToken);
    if (!existing_user) {
      const new_user = await this.createNewUserFromMarvin(user);
      tokens = await this.authLocalService.get2FATokens(
        new_user.id,
        new_user.email,
        false,
        false,
      );
      await this.userService.add_new_rt(new_user.id, tokens.refresh_token);
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_RT),
        sameSite: 'lax',
      });
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_AT),
        sameSite: 'lax',
      });
      await this.userService.set_user_status(new_user.id, 1);
      res.redirect('http://localhost:8080/marvin/login/success/on');
      return { token: tokens.access_token };
    } else {
      tokens = await this.authLocalService.get2FATokens(
        existing_user.id,
        existing_user.email,
        existing_user.two_factor_enabled,
        false,
      );
      await this.userService.add_new_rt(existing_user.id, tokens.refresh_token);
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_AT),
        sameSite: 'lax',
      });
      if (existing_user.two_factor_enabled) {
        return res.redirect('http://localhost:8080/otp/authenticate');
      } else {
        res.cookie('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_RT),
          sameSite: 'lax',
        });
        await this.userService.set_user_status(existing_user.id, 1);
        res.redirect('http://localhost:8080/marvin/login/success/on');
        return { token: tokens.access_token };
      }
    }
  }
}
