import { IsNumber, IsDate } from 'class-validator';

export class ChanUserInfosDto {
  @IsNumber()
  user_role_id: number;

  @IsNumber()
  user_mode_id: number;

  @IsNumber()
  mode_time: number;

  @IsDate()
  mode_date_hour: Date;
}
