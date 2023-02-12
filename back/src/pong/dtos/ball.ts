import { IsString } from 'class-validator';

export class BallDto {
  x: number;

  y: number;

  radius: number;

  speed: number;

  velocityX: number;

  velocityY: number;

  @IsString()
  color: string;

  top?: number;

  bottom?: number;

  left?: number;

  right?: number;
}
