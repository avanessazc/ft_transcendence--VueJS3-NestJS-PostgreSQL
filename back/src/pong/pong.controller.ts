import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PongInvitationDto } from './dtos';
import { PongService } from './pong.service';
import { matches } from './pong.service';
import { AuthGuard } from '@nestjs/passport';
import { PongInv, PongMatchInv } from './types/pong.type';

@Controller('pong')
export class PongController {
  constructor(private readonly pongService: PongService) {}

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('ranking')
  async get_users(): Promise<PongInv> {
    try {
      return await this.pongService.get_users();
    } catch (e) {
      console.log('get_users');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('check-update-match')
  async get_open_invitation(
    @Body() body: { userId: string; chiefId: string },
  ): Promise<PongMatchInv> {
    try {
      return await this.pongService.check_update_match(body);
    } catch (e) {
      console.log('check-update-match');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('matches-history/:userId')
  async get_matches_list(
    @Param('userId') userId: string,
  ): Promise<PongMatchInv> {
    try {
      return await this.pongService.get_matches_list(userId);
    } catch (e) {
      console.log('matches-history_user');
    }
  }

  @Get('pending-matches/:userId')
  async get_pending_matches(
    @Param('userId') userId: string,
  ): Promise<PongMatchInv> {
    try {
      return await this.pongService.get_pending_accepted_matches_list(userId);
    } catch (e) {
      console.log('ending-matches_user');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('pending-invitation-user/:player_id')
  async find_pending_invitation_with_user_x(
    @Param('player_id') player_id: string,
  ): Promise<PongMatchInv> {
    try {
      return await this.pongService.find_pending_invitation_with_user_x(
        player_id,
      );
    } catch (e) {
      console.log('pending-invitation-user');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('invitations/:id')
  async get_pong_invitations(@Param('id') id: string): Promise<PongInv> {
    try {
      return await this.pongService.get_pong_invitations(id);
    } catch (e) {
      console.log('invitations ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('update')
  async update_to_play_invitation(
    @Body() dto: Partial<PongInvitationDto>,
  ): Promise<PongMatchInv> {
    try {
      return await this.pongService.update_to_play_invitation(
        dto.id,
        dto.from_player_id,
        dto.to_player_id,
        dto.invitation_status_id,
      );
    } catch (e) {
      console.log('update ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('match/updated-info/:match_id')
  get_updated_match_info(@Param('match_id') match_id: string) {
    try {
      return matches.find((elem) => elem.match_id == match_id);
    } catch (e) {
      console.log('match_updated-info ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('match/:match_id')
  async get_match_by_id(
    @Param('match_id') match_id: string,
  ): Promise<PongMatchInv> {
    try {
      return await this.pongService.find_match_by_id(match_id);
    } catch (e) {
      console.log('match ');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('match/create')
  async create_match(@Body() dto: Partial<PongInvitationDto>): Promise<any> {
    return await this.pongService.create_match(
      dto.from_player_id,
      dto.to_player_id,
      dto.invitation_status_id,
      dto.pong_map,
    );
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Delete('delete/:from_id/:to_id')
  async delete_pending_match_invitation(
    @Param('from_id') from_id: string,
    @Param('to_id') to_id: string,
  ) {
    try {
      await this.pongService.delete_pending_match_invitation(from_id, to_id);
    } catch (e) {
      console.log('delete_pending_match_invitation');
    }
  }
}
