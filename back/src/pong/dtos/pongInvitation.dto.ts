import { IsString } from 'class-validator';

export class PongInvitationDto {
  @IsString()
  id?: string;

  @IsString()
  from_player_id?: string;

  @IsString()
  from_player_nickname?: string;

  @IsString()
  from_player_avatar?: string;

  @IsString()
  to_player_id?: string;

  @IsString()
  to_player_nickname?: string;

  @IsString()
  to_player_avatar?: string;

  invitation_status_id?: number;

  score_from_player?: number;

  score_to_player?: number;

  points?: number;

  @IsString()
  winner_id?: string;

  invitation_date?: Date;

  start_date?: Date;

  end_date?: Date;

  game_over?: boolean;

  pong_map?: number;
}
