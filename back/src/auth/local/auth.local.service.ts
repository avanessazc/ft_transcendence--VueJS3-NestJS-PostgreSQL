import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthDto } from '../dto';
import * as argon2 from 'argon2';
import { Tokens, User } from '../types';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { toDataURL, toFileStream } from 'qrcode';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { UserService } from '../../user/user.service';
import { error_codes } from '../../errors';

@Injectable()
export class AuthLocalService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  async get2FATokens(
    userId: string,
    email: string,
    two_factor_enabled: boolean,
    isTwoFactorAuthOK: boolean,
  ) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          two_factor_enabled,
          isTwoFactorAuthOK,
        },
        {
          secret: process.env.JWT_AT_SECRET,
          expiresIn: parseInt(process.env.EXPIRE_TIME_JWT_AT),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          two_factor_enabled,
          isTwoFactorAuthOK,
        },
        {
          secret: process.env.JWT_RT_SECRET,
          expiresIn: parseInt(process.env.EXPIRE_TIME_JWT_RT),
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async get2FactorAuthSecret(userId: string) {
    const user = await this.userService.find_one_by_id(userId);
    return user.two_factor_auth_secret;
  }

  async signupLocal(
    dto: Partial<AuthDto>,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (dto.password !== dto.password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }
    const hash = await this.hashData(dto.password);
    dto.password = hash;
    let existing_user = await this.userService.find_one_by_nickname_all_fields(
      dto.nickname,
    );

    if (existing_user) {
      return error_codes[0];
    }
    existing_user = await this.userService.find_one_by_email(dto.email);
    if (existing_user) {
      return error_codes[1];
    }
    const newUser = await this.userService.create_new_user(dto);
    await this.userService.create_achievementsPerUser(newUser.id);
    const tokens = await this.get2FATokens(
      newUser.id,
      newUser.email,
      false,
      false,
    );
    await this.userService.add_new_rt(newUser.id, tokens.refresh_token);
    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_RT),
      sameSite: 'lax',
    });
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_AT),
      sameSite: 'lax',
    });
    return { user: newUser };
  }

  async signinLocal(
    dto: Partial<AuthDto>,
    @Res({ passthrough: true }) res: Response,
    refreshToken: string,
  ): Promise<object> {
    const user = await this.userService.find_one_by_email(dto.email);
    if (!user) {
      throw new ForbiddenException('User Access Denied');
    }
    const passwordMatches = await argon2.verify(user.hash, dto.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Password Access Denied');
    }
    let tokens: Tokens;
    if (refreshToken) await this.userService.remove_former_rt(refreshToken);
    if (user.two_factor_enabled === true)
      tokens = await this.get2FATokens(user.id, user.email, true, false);
    else {
      tokens = await this.get2FATokens(user.id, user.email, false, false);
      await this.userService.add_new_rt(user.id, tokens.refresh_token);
    }
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
    return {
      user: user,
      token: tokens.access_token,
      twofa: user.two_factor_enabled,
    };
  }

  async checkCredentials(
    dto: Partial<AuthDto>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<object> {
    const user = await this.userService.find_one_by_email(dto.email);
    if (!user) {
      throw new ForbiddenException('Email Access Denied');
    }

    const passwordMatches = await argon2.verify(user.hash, dto.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Password Access Denied');
    }
    const tokens: Tokens = await this.get2FATokens(
      user.id,
      user.email,
      true,
      false,
    );
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_AT),
      sameSite: 'lax',
    });
    return {
      email: user.email,
    };
  }

  async logout(refresh_token: string) {
    try {
      await this.userService.delete_refresh_token(refresh_token);
    } catch (e) {
      console.log('Logout');
    }
  }

  async refreshTokens(
    userId: string,
    email: string,
    two_factor_enabled: boolean,
    isTwoFactorAuthOK: boolean,
    refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const existing_rt = await this.userService.find_first_refresh_token(
        refreshToken,
      );
      const tokens = await this.get2FATokens(
        userId,
        email,
        two_factor_enabled,
        isTwoFactorAuthOK,
      );
      response.status(200);
      if (existing_rt) {
        await this.userService.remove_former_rt(existing_rt.refresh_token);
      }
      const check_userId = await this.userService.find_one_by_id(userId);
      if (check_userId) {
        await this.userService.add_new_rt(userId, tokens.refresh_token);
        response.cookie('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_RT),
          sameSite: 'lax',
        });
        response.cookie('access_token', tokens.access_token, {
          httpOnly: true,
          maxAge: parseInt(process.env.EXPIRE_TIME_COOKIE_AT),
          sameSite: 'lax',
        });
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async renameTmpAvatarFile(
    tmp_file: string,
    typemime: string,
    userId: string,
  ) {
    const filename = `avatar-${tmp_file}.${typemime}`;
    await fs.rename('./files/' + tmp_file, './files/' + filename, () => {});
    await this.userService.update_avatar_file_name(userId, filename);
  }

  async analyzeTypemime(tmp_file: string): Promise<string> {
    return new Promise(async (resolve) => {
      const readStream = await fs.createReadStream(tmp_file);
      const data = [];
      readStream.on('data', (chunk) => {
        data.push(chunk);
      });
      let typemime: string;
      return readStream.on('end', async () => {
        const buf = Buffer.concat(data);
        if (
          buf[0] == 255 &&
          buf[1] == 216 &&
          buf[2] == 255 &&
          (buf[3] == 219 || buf[3] == 224 || buf[3] == 225 || buf[3] == 238)
        )
          typemime = 'jpg';
        else if (buf[0] == 137 && buf[1] == 80 && buf[2] == 78 && buf[3] == 71)
          typemime = 'png';
        else typemime = 'other';
        resolve(typemime);
      });
    });
  }

  async turnOnTwoFactorAuth(user: User) {
    await this.userService.update_two_factor_on(user);
    const tokens: Tokens = await this.get2FATokens(
      user['sub'],
      user.email,
      true,
      true,
    );
    await this.userService.add_new_rt(user['sub'], tokens.refresh_token);
    return tokens;
  }

  async turnOffTwoFactorAuth(user: User) {
    await this.userService.update_two_factor_off(user);
    const tokens: Tokens = await this.get2FATokens(
      user['sub'],
      user.email,
      false,
      false,
    );
    await this.userService.add_new_rt(user['sub'], tokens.refresh_token);
    return tokens;
  }

  async generatetwo_factor_auth_secret(user: User) {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTH_APP_NAME,
      secret,
    );
    await this.settwo_factor_auth_secret(secret, user['sub']);
    return {
      secret,
      otpAuthUrl,
    };
  }

  async isTwoFactorAuthCodeValid(twoFactorAuthCode: string, userId: string) {
    return authenticator.verify({
      token: twoFactorAuthCode,
      secret: await this.get2FactorAuthSecret(userId),
    });
  }

  async settwo_factor_auth_secret(secret: string, userId: string) {
    await this.userService.update_two_factor_secret(secret, userId);
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async generateQrCode(stream: Response, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  async signin2FA(user, @Res({ passthrough: true }) res: Response) {
    const tokens: Tokens = await this.get2FATokens(
      user['sub'],
      user['email'],
      true,
      true,
    );
    await this.userService.add_new_rt(user['sub'], tokens.refresh_token);
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
    return tokens;
  }
}
