import { Controller } from '@nestjs/common';
import { Body, Param, Patch, Post, Get, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateChannelDto } from './dto/create-channel.dto';
import {
  ChanNameNoMaxLengthDto,
  PPChannelNoMinMaxLengthDto,
} from './dto/check-chan-name.dto';
import { ChanUserListDto } from './dto/chan-users-list.dto';
import { MemberNonMemberChannelsDto } from './dto/member-non-member-channels.dto';
import { ChanUserInfosDto } from './dto/chan-user-infos.dto';
import { UserInChannelDto } from './dto/user-in-channel.dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('/update-user-to-chan-admin')
  async updateUserToChanAdmin(
    @Body() body: { from_id: string; user_id: string; chan_id: string },
  ) {
    try {
      await this.messagesService.updateUserToChanAdmin(
        body.from_id,
        body.user_id,
        body.chan_id,
      );
    } catch (e) {
      console.log('update-user-to-chan-admin');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('/kick-user-from-chan')
  async kickUserFromChan(
    @Body() body: { from_id: string; user_id: string; chan_id: string },
  ) {
    try {
      await this.messagesService.kickUserFromChan(
        body.from_id,
        body.user_id,
        body.chan_id,
      );
    } catch (e) {
      console.log('kick-user-from-chan');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('/update-user-to-chan-basic-user')
  async updateUserToChanBasicUser(
    @Body() body: { from_id: string; user_id: string; chan_id: string },
  ) {
    try {
      await this.messagesService.updateUserToChanBasicUser(
        body.from_id,
        body.user_id,
        body.chan_id,
      );
    } catch (e) {
      console.log('update-user-to-chan-basic-user');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('/update-user-mode')
  async updateUserMode(
    @Body()
    body: {
      from_id: string;
      user_id: string;
      chan_id: string;
      user_mode_id: number;
    },
  ) {
    try {
      await this.messagesService.updateUserMode(
        body.from_id,
        body.user_id,
        body.chan_id,
        body.user_mode_id,
      );
    } catch (e) {
      console.log('update-user-mode');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chief')
  async getChief(): Promise<string> {
    try {
      return await this.messagesService.getChief();
    } catch (e) {
      console.log('get-chief');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('check-chan-name')
  async checkChanName(@Body() body: ChanNameNoMaxLengthDto) {
    try {
      return await this.messagesService.checkChanName(body.chan_name);
    } catch (e) {
      console.log('check-chan-name');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('get-chan-member-status')
  async getChanMemberStatus(
    @Body() body: { chan_name: string; cur_user_id: string },
  ) {
    try {
      return await this.messagesService.getChanMemberStatus(
        body.chan_name,
        body.cur_user_id,
      );
    } catch (e) {
      console.log('get-chan-member-status');
    }
  }

  @Post('register-client-socket')
  async registerClientSocket(
    @Body() body: { user_id: string; socket_id: string },
  ) {
    try {
      return await this.messagesService.registerClientSocket(
        body.user_id,
        body.socket_id,
      );
    } catch (e) {
      console.log('register-client-socket');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('check-chan-pwd')
  async checkChanPwd(@Body() body: PPChannelNoMinMaxLengthDto) {
    try {
      return await this.messagesService.checkChanPwd(
        body.chan_name,
        body.pp_formData.chan_pwd,
      );
    } catch (e) {
      console.log('check-chan-pwd');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('check-current-chan-owner')
  async checkCurrentChanOwner(
    @Body() body: { from_id: string; chan_id: string },
  ) {
    try {
      return await this.messagesService.checkCurrentChanOwner(body.chan_id);
    } catch (e) {
      console.log('check-current-chan-owner');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('create-channel')
  async createChannel(@Body() body: CreateChannelDto) {
    try {
      return await this.messagesService.createChannel(body);
    } catch (e) {
      console.log('create-channel');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('leave-channel')
  async leaveChannel(
    @Body() body: { user_id: string; channel_id: string },
  ): Promise<{ count: number }> {
    try {
      return await this.messagesService.leaveChannel(
        body.user_id,
        body.channel_id,
      );
    } catch (e) {
      console.log('leave-channel');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('get-avatar-by-nickname')
  async getAvatarByNickname(
    @Body() body: { nickname: string },
  ): Promise<string> {
    try {
      return await this.messagesService.getAvatarByNickname(body.nickname);
    } catch (e) {
      console.log('get-avatar-by-nickname');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chan-topic/:chan_name')
  async getChanTopic(@Param('chan_name') chan_name: string): Promise<string> {
    try {
      return await this.messagesService.getChanTopic(chan_name);
    } catch (e) {
      console.log('get-chan-topic');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chan-type/:chan_name')
  async getChanType(@Param('chan_name') chan_name: string): Promise<number> {
    try {
      return await this.messagesService.getChanType(chan_name);
    } catch (e) {
      console.log('get-chan-type');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chan-details/:chan_id')
  async getChanDetails(
    @Param('chan_id') chan_id: string,
  ): Promise<{ topic: string; type_id: number }> {
    try {
      return await this.messagesService.getChanDetails(chan_id);
    } catch (e) {
      console.log('get-chan-details');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chan-owner-user-id/:chan_id')
  async getChanOwnerUserId(@Param('chan_id') chan_id: string): Promise<string> {
    try {
      return await this.messagesService.getChanOwnerUserId(chan_id);
    } catch (e) {
      console.log('get-chan-owner-user-id');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chan-users-list/:chan_id')
  async getChanUsersList(
    @Param('chan_id') chan_id: string,
  ): Promise<ChanUserListDto> {
    try {
      return await this.messagesService.getChanUsersList(chan_id);
    } catch (e) {
      console.log('get_chan_users_list');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-member-non-member-channels/:id')
  async getMemberNonMemberChannelsUser(
    @Param('id') user_id: string,
  ): Promise<MemberNonMemberChannelsDto> {
    try {
      return await this.messagesService.getMemberNonMemberChannelsUser(user_id);
    } catch (e) {
      console.log('get_member_non-member_channels');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chan-id/:chan_name')
  async getChanId(@Param('chan_name') chan_name: string): Promise<string> {
    try {
      return await this.messagesService.getChanId(chan_name);
    } catch (e) {
      console.log('get-chan-id');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('/retrieve-chan-id')
  async retrieveChanId(@Body('chan_name') chan_name: string): Promise<string> {
    try {
      return await this.messagesService.getChanId(chan_name);
    } catch (e) {
      console.log('retrieve-chan-id');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-user-id/:nickname')
  async getUserId(@Param('nickname') nickname: string): Promise<string> {
    try {
      return await this.messagesService.getUserId(nickname);
    } catch (e) {
      console.log('get-user-id');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-chan-user-infos/:user_id/:chan_id')
  async getChanUserInfos(
    @Param('user_id') user_id: string,
    @Param('chan_id') chan_id,
  ): Promise<ChanUserInfosDto> {
    try {
      return await this.messagesService.getChanUserInfos(user_id, chan_id);
    } catch (e) {
      console.log('get-chan-user-infos');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/get-user-in-channel/:user_id/:channel_name')
  async get_user_in_channel(
    @Param('user_id') user_id: string,
    @Param('channel_name') channel_name: string,
  ): Promise<UserInChannelDto> {
    try {
      return await this.messagesService.get_user_in_channel(
        user_id,
        channel_name,
      );
    } catch (e) {
      console.log('get-user-in-channel');
    }
  }
}
