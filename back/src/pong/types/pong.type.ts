export type Player = {
  socket_id?: string;
  player_id: string;
  nickname: string;
  avatar: string;
  in: boolean;
  pos_x: number;
  pos_y: number;
  w: number;
  h: number;
  color: string;

  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type Viewer = {
  socket_id: string;
  nickname: string;
  avatar: string;
  in: boolean;
};
export type MatchInfo = {
  match_id: string;
  players: { fromPlayer: Player; toPlayer: Player };
  viewers: Array<Viewer>;
  score: { from_score: number; to_score: number };
  start_game?: boolean;
  stop_game?: boolean;
  game_over?: boolean;
  start_date?: Date;
  end_date?: Date;
  pong_map?: number;
  bgColor?: string;
  blackhole_frame?: number;
  blackhole_length?: number;
  blackhole_coords: { x: number; y: number };
  nb_frames: number;
  pause_goal: boolean;
};

export interface Net {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export type PendingGames = {
  player_id: string;
  invitation_status_id: number;
  who_invites_to_play_pong: number;
  game_over: string;
};

export type PongInv = {
  match_id?: string;
  id?: string; //user
  nickname?: string;
  email?: string;
  firstname?: string;
  surname?: string;
  avatar?: string;
  status_id?: string;

  points?: number;
  pos?: number;
};

export type PongMatchInv = {
  id?: string;
  from_player_id?: string;
  from_player_nickname?: string;
  from_player_avatar?: string;
  score_from_player?: number;
  to_player_id?: string;
  to_player_nickname?: string;
  to_player_avatar?: string;
  score_to_player?: number;
  invitation_status_id?: number;
  winner_id?: string;
  points?: number;
  pong_map?: number;
  invitation_date?: Date;
  start_date?: Date;
  end_date?: Date;
  res?: string;
  actions?: string;
  game_over?: boolean;

  player_id?: string;
  who_invites_to_play_pong?: number;
};
