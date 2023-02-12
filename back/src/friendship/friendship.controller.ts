import { Controller, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FriendshipDto } from './dtos';
import { Body, Patch, Delete, Param, Post, Get, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { AuthGuard } from '@nestjs/passport';
import { FriendshipInv, FriendshipUser } from './types/friendshipUsers';

@Controller('friendship')
export class FriendshipController {
  constructor(
    private httpService: HttpService,
    private friendshipService: FriendshipService,
  ) {}

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('users/:id')
  async get_users(@Param('id') id: string): Promise<FriendshipUser> {
    return await this.friendshipService.get_users(id);
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('friends/:id')
  async get_friends(@Param('id') id: string): Promise<FriendshipUser> {
    return await this.friendshipService.get_friends(id);
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('invitations/:id')
  async get_friendship_invitations(
    @Param('id') id: string,
  ): Promise<FriendshipUser> {
    return await this.friendshipService.get_friendship_invitations(id);
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('status/:from_id/:to_id')
  async get_friendship_status(
    @Param('from_id') from_id: string,
    @Param('to_id') to_id: string,
  ): Promise<FriendshipInv> {
    try {
      const friendship_id: string = this.friendshipService.define_friendship_id(
        from_id,
        to_id,
      );
      return await this.friendshipService.get_friendship_status(
        from_id,
        friendship_id,
      );
    } catch (e) {
      console.log('get_friendship');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('check-if-friends')
  async check_if_friends(
    @Req() request,
    @Body() body: { first_user_id: string; second_user_id: string },
  ) {
    const cur_user_id = request.user['sub'];
    if (body.first_user_id == cur_user_id || body.second_user_id == cur_user_id)
      return this.friendshipService.check_if_friends(
        body.first_user_id,
        body.second_user_id,
      );
    return false;
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('create')
  async create_friendship(@Body() dto: FriendshipDto) {
    try {
      const friendship_id: string = this.friendshipService.define_friendship_id(
        dto.from_id,
        dto.to_id,
      );
      return await this.friendshipService.update_friendship(
        friendship_id,
        dto.from_id,
        dto.to_id,
        dto.status,
      );
    } catch (e) {
      console.log('create_friendship');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('update')
  async update_friendship(@Body() dto: FriendshipDto) {
    try {
      const friendship_id: string = this.friendshipService.define_friendship_id(
        dto.from_id,
        dto.to_id,
      );
      return await this.friendshipService.update_friendship(
        friendship_id,
        dto.from_id,
        dto.to_id,
        dto.status,
      );
    } catch (e) {
      console.log('update_friendship');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Delete('delete/:id1/:id2')
  async delete_friendship(
    @Param('id1') from: string,
    @Param('id2') to: string,
  ) {
    try {
      const friendship_id: string = this.friendshipService.define_friendship_id(
        from,
        to,
      );
      return await this.friendshipService.delete_friendship(friendship_id);
    } catch (e) {
      console.log('delete_friendship');
    }
  }
}
