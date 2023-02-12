import { Controller, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrivateChanInvitationDto } from './dtos';
import { Body, Delete, Param, Post, Get } from '@nestjs/common';
import { PrivateChanInvitationService } from './privateChanInvitation.service';
import { AuthGuard } from '@nestjs/passport';
import { PCUsers } from './types/pc-users';
import { PCInvitations } from './types/pc-invitations';

@Controller('private-channel-invitation')
export class PrivateChanInvitationController {
  constructor(
    private httpService: HttpService,
    private privateChanInvitation: PrivateChanInvitationService,
  ) {}

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('users/:user_id/:channel_id')
  async get_users(
    @Param('user_id') user_id: string,
    @Param('channel_id') channel_id: string,
  ): Promise<PCUsers> {
    return await this.privateChanInvitation.get_users(user_id, channel_id);
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('invitations/:id')
  async get_private_channel_invitations(
    @Param('id') id: string,
  ): Promise<PCInvitations> {
    try {
      return await this.privateChanInvitation.get_private_channel_invitations(
        id,
      );
    } catch (e) {
      console.log('get_private_invitation: ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('create')
  async create_private_invitation(@Body() dto: PrivateChanInvitationDto) {
    try {
      return await this.privateChanInvitation.create_private_invitation(dto);
    } catch (e) {
      console.log('create_private_invitation: ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Delete('delete/:id')
  async delete_friendship(@Param('id') id: string) {
    try {
      return await this.privateChanInvitation.delete_invitation(id);
    } catch (e) {
      console.log('delete_friendship');
    }
  }
}
