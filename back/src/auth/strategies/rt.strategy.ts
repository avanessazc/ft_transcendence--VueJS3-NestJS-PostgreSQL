import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../types/';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['refresh_token'];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      secretOrKey: process.env.JWT_RT_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    if (payload === null) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
