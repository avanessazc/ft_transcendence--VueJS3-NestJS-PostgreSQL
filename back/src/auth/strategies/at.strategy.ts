import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../types/';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['access_token'];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      secretOrKey: process.env.JWT_AT_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    return payload;
  }
}
