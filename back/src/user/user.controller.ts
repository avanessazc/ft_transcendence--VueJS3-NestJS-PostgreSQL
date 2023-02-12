import { UserService } from './user.service';
import {
  Body,
  Controller,
  Param,
  Req,
  Res,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { Response, Request, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthLocalService } from '../auth/local/auth.local.service';
import { UserIdDto } from '../dtos';
import * as fs from 'fs';
import { Errors, error_codes } from '../errors';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/types';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authLocalService: AuthLocalService,
  ) {}

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('user/find/:id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      return await this.userService.findOne(id);
    } catch (e) {
      console.log('findOne ');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/find-by-id-through-access-token')
  async findOneByEmail(@Req() request: Request): Promise<{ user: User }> {
    try {
      const user = await this.userService.find_one_by_id(request.user['sub']);
      return { user: user };
    } catch (e) {
      console.log('findOneByEmail ');
    }
  }

  @Get('user/check-2fa/:email')
  async check2FA(@Param('email') email: string): Promise<User> {
    try {
      return await this.userService.find_one_by_email_restricted(email);
    } catch (e) {
      console.log('check2FA ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('user')
  async user(@Req() request: Request) {
    try {
      const tmp = await this.userService.user(request);
      if (Object.keys(tmp.error).length === 0) {
        return tmp.data;
      } else {
        return tmp.error;
      }
    } catch (e) {
      console.log('user');
    }
  }

  @Get('user/clear-access-token')
  async clearAccessToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('access_token');
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('users')
  async getAllUsers() {
    return await this.userService.getAllUsers('Users');
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/user/check-alive-refresh-tokens/:id')
  async check_alive_refresh_tokens(
    @Param('id') user_id: string,
  ): Promise<number> {
    try {
      return await this.userService.check_alive_refresh_tokens(user_id);
    } catch (e) {
      console.log('check-alive-refresh-tokens');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('/user/set-status/')
  async setUser_Status(@Body() data: { user_id: string; status_code: number }) {
    try {
      await this.userService.set_user_status(data.user_id, data.status_code);
    } catch (e) {
      console.log('user_set-status ');
    }
  }

  // Serving Static Files from NestJS RankingView.vue
  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('files/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res) {
    try {
      res.sendFile(fileId, { root: 'files' }, (error) => {
        if (error) {
          console.log(fileId, ' file does not exist');
        }
      });
    } catch (e) {
      console.log('files_fileId ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('users/update')
  @UseInterceptors(
    FileInterceptor('new_avatar', {
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
  async update_user_profile(
    @Body() dto: UserIdDto,
    @UploadedFile() new_avatar: Express.Multer.File,
  ) {
    const path = 'http://localhost:3000/files/';
    const old_avatar_file = dto.avatar.substr(path.length, dto.avatar.length);
    try {
      if (new_avatar !== undefined) {
        const real_typemime: string =
          await this.authLocalService.analyzeTypemime(
            './files/' + new_avatar.filename,
          );
        if (real_typemime !== 'png' && real_typemime !== 'jpg') {
          fs.unlink('./files/' + new_avatar.filename, (err) => {
            if (err) console.log('unlink new_avatar.filename');
          });
          return error_codes[3];
        }
        dto.avatar = path + new_avatar.filename;
      }
      if (dto.deleted_avatar === true) {
        dto.avatar = path + 'defaultAvatar.jpeg';
      }
      const updated_user = await this.userService.update_user_profile(dto);
      if (Object.keys(updated_user.error).length === 0) {
        if (updated_user.data === undefined && new_avatar !== undefined) {
          dto.avatar = dto.avatar.substr(path.length, dto.avatar.length);
          fs.unlink('./files/' + dto.avatar, (err) => {
            if (err) console.log('unlink dto.avatar');
            else {
              console.log('\nAvatar file deleted');
            }
          });
        }
        if (
          (old_avatar_file !== 'defaultAvatar.jpeg' &&
            new_avatar !== undefined) ||
          (dto.deleted_avatar === true &&
            old_avatar_file !== 'defaultAvatar.jpeg')
        ) {
          fs.unlink('./files/' + old_avatar_file, (err) => {
            if (err) console.log('unlink old_avatar_file');
            else {
              console.log('\nOld avatar file deleted');
            }
          });
        }
        return updated_user.data;
      }
      return updated_user.error;
    } catch (e) {
      return error_codes[3];
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('user/profile/:nickname')
  async find_one_by_nickname(
    @Param('nickname') nickname: string,
  ): Promise<{ user: User; error: Errors }> {
    try {
      const user = await this.userService.find_one_by_nickname(nickname);
      if (!user) {
        return { user: {}, error: error_codes[5] };
      } else {
        return { user: user, error: undefined };
      }
    } catch (e) {
      console.log('user_profile_nickname');
    }
  }
}
