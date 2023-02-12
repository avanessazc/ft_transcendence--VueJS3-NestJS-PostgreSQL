import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class ChanUserListDto {
  @IsString()
  nickname: string;

  @IsNumber()
  status_id: number;

  @IsString()
  channel_id: string;

  @IsString()
  user_id: string;

  @IsString()
  user_mode_id: string;

  @IsString()
  user_role_id: string;

  @IsNumber()
  mode_time: number;

  mode_date_hour: Date;

  @IsString()
  user_owner_id: string;

  @IsBoolean()
  is_owner: boolean;
}
