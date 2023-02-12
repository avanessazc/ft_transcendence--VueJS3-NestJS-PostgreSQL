import { IsString } from 'class-validator';

export class PlayerDto {
  @IsString()
  match_id: string;

  @IsString()
  from_id: string;

  @IsString()
  to_id: string;

  status: number;

  @IsString()
  nickname: string;

  pos_x: number;

  pos_y: number;

  w: number;

  h: number;

  @IsString()
  color: string;

  score: number;

  @IsString()
  side: string;

  top?: number;

  bottom?: number;

  left?: number;

  right?: number;
}
