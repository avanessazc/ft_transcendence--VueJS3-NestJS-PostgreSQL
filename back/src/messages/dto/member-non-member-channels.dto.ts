import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class MemberNonMemberChannelsDto {
  @IsString()
  title: string;

  @IsNumber()
  type_id: number;

  @IsString()
  user_owner_id: string;

  @IsString()
  channel_id: string;

  @IsNumber()
  user_mode_id: number;

  @IsBoolean()
  is_in: boolean;
}
