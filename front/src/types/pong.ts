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

export type Net = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type Ball = {
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
};

export type PendingGames = {
  player_id: string;
  invitation_status_id: number;
  who_invites_to_play_pong: number;
  game_over: string;
};
