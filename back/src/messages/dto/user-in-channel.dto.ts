import { IsString, IsNumber } from 'class-validator';

export class UserInChannelDto {
  @IsString()
  user_id: string;

  @IsString()
  channel_id: string;

  @IsNumber()
  user_mode_id: number;

  @IsNumber()
  user_role_id: number;

  @IsNumber()
  type_id: number;

  @IsString()
  title: string;

  @IsString()
  topic: string;
}
