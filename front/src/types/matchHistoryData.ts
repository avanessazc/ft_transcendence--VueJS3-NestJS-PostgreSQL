export interface Match {
  id?: string;
  from_player_id?: string;
  from_player_nickname: string;
  from_player_avatar?: string;
  score_from_player?: number;
  to_player_id?: string;
  to_player_nickname: string;
  to_player_avatar?: string;
  score_to_player?: number;
  invitation_status_id?: number;
  res?: string;
  viewer_id?: Array<string>;
  actions?: string;
  points?: number;
  winner_id?: string;
  invitation_date?: Date;
  start_date?: Date;
  end_date?: Date;
  game_over?: boolean;
}
