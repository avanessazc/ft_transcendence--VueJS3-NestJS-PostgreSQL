import { IsString } from 'class-validator';

export class AchievementsDto {
  @IsString()
  from_id: string;

  @IsString()
  to_id: string;

  status: number;
}
