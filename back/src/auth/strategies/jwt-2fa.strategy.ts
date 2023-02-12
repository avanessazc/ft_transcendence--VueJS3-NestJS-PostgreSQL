import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { Request } from 'express';
import { JwtPayload } from '../types/';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly userService: UserService) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['access_token'];
          return data;
        },
      ]),
      secretOrKey: process.env.JWT_AT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    try {
      if (!payload.email) {
        throw new UnauthorizedException(
          '1 - Forbidden Access: you are not logged in.',
        );
      } else if (payload.two_factor_enabled && !payload.isTwoFactorAuthOK) {
        throw new UnauthorizedException(
          '3 - Forbidden Access: you are not logged in.',
        );
      } else return payload;
    } catch (e) {
      throw new UnauthorizedException(
        '4 - Forbidden Access: you are not logged in.',
      );
    }
  }
}
