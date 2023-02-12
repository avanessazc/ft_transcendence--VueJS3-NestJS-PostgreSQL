import { Controller, Redirect, Query, Req, Res, Get } from '@nestjs/common';
import { AuthMarvinService } from './auth.marvin.service';
import { Response } from 'express';
import { Request } from 'express';

@Controller('auth/marvin')
export class AuthMarvinController {
  constructor(private authMarvinService: AuthMarvinService) {}

  @Get('')
  @Redirect(process.env.MARVIN_OUR_API_URL, 302)
  async marvinAuth() {
    console.log('Marvin oAuth Redirection');
  }

  @Get('callback')
  async marvinAuthRedirect(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response,
    @Req() req: Request,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    return await this.authMarvinService.marvinLogin(
      code,
      state,
      response,
      refreshToken,
    );
  }
}
