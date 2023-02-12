import { IsString } from 'class-validator';

export class DBMatchInfo {
  @IsString()
  id: string;

  @IsString()
  from_player_id: string;

  @IsString()
  from_player_nickname: string;

  @IsString()
  from_player_avatar: string;

  score_from_player: number;

  @IsString()
  to_player_id: string;

  @IsString()
  to_player_nickname: string;

  @IsString()
  to_player_avatar: string;

  score_to_player: number;

  invitation_status: number;

  points: number;

  winner_id: object;

  invitation_date: Date;

  start_date: Date;

  end_date: Date;

  game_over: boolean;

  pong_map: number;
}
