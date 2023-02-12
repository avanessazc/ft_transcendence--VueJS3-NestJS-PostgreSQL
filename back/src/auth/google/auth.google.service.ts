import { Injectable, Req, Res } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tokens, GoogleUser } from '../types';
import { JwtService } from '@nestjs/jwt';
import { generateFromEmail } from 'unique-username-generator';
import { generate } from 'generate-password';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { UserService } from '../../user/user.service';
import { AuthLocalService } from '../local/auth.local.service';

@Injectable()
export class AuthGoogleService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private readonly httpService: HttpService,
    private authLocalService: AuthLocalService,
  ) {}

  async googleLogin(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    refreshToken: string,
  ) {
    if (!req.user) {
      res.redirect('http://localhost:8080/google/login/failure');
    }
    const { tokens, existing_user } = await this.registerOrSignIn(
      req.user,
      refreshToken,
    );
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_AT),
      sameSite: 'lax',
    });
    if (existing_user.two_factor_enabled) {
      res.redirect('http://localhost:8080/otp/authenticate');
    } else {
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_RT),
        sameSite: 'lax',
      });
      await this.userService.set_user_status(existing_user.id, 1);
      res.redirect('http://localhost:8080/popup');
    }
  }

  async registerOrSignIn(user, refreshToken: string) {
    let tokens: Tokens;

    let existing_user = await this.userService.find_one_by_email(user.email);

    if (!existing_user) {
      const new_user = await this.createNewUserFromGoogle(user);
      await this.userService.create_achievementsPerUser(new_user.id);
      tokens = await this.authLocalService.get2FATokens(
        new_user.id,
        new_user.email,
        false,
        false,
      );
      await this.userService.add_new_rt(new_user.id, tokens.refresh_token);
      existing_user = new_user;
    } else {
      tokens = await this.authLocalService.get2FATokens(
        existing_user.id,
        existing_user.email,
        existing_user.two_factor_enabled,
        false,
      );
      if (refreshToken) await this.userService.remove_former_rt(refreshToken);
      await this.userService.add_new_rt(existing_user.id, tokens.refresh_token);
    }
    return { tokens, existing_user };
  }

  async createNewUserFromGoogle(user: GoogleUser) {
    const password = generate({ length: 20, numbers: true });
    const hash = await this.authLocalService.hashData(password);
    const new_nickname = await this.generateUniqueNickname(user.email);

    user.password = hash;
    user.nickname = new_nickname;
    const new_user = await this.userService.create_new_google_user(user);
    const tmp_file = await this.download(new_user.avatar);
    if (tmp_file == 'error_file') {
      await this.userService.update_avatar_file_name(
        new_user.id,
        'defaultAvatar.jpeg',
      );
      return new_user;
    }
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

  async download(url: string): Promise<string> {
    const hash = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const dest = './files/' + hash;
    return new Promise(async (resolve, reject) => {
      try {
        const file = fs.createWriteStream(dest, { flags: 'wx' });
        const response = await this.httpService.axiosRef({
          url,
          method: 'GET',
          responseType: 'stream',
        });
        if (response.status === 200) {
          response.data.pipe(file);
        } else {
          file.close();
          fs.unlink(dest, () => {});
          reject(`Server responded with ${response.status}`);
        }
        file.on('finish', () => {
          resolve(hash);
        });
        file.on('error', (err) => {
          file.close();
          if (err) {
            reject('File already exists');
          } else {
            fs.unlink(dest, () => {});
            reject(err.message);
          }
        });
      } catch (error) {
        resolve('error_file');
      }
    });
  }

  async generateUniqueNickname(email: string) {
    let generated_nickname: string = generateFromEmail(email, 3);
    while (
      await this.userService.find_one_by_nickname_all_fields(generated_nickname)
    ) {
      generated_nickname = generateFromEmail(email, 3);
    }
    return generated_nickname;
  }
}
