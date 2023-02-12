import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
export class CreateMessageDto {
  @IsString()
  msg_id: string;

  @IsString()
  user_id: string;

  @IsString()
  @MaxLength(20)
  nickname: string;

  @IsString()
  content: string;

  @IsBoolean()
  current_user: boolean;

  @IsString()
  side: string;

  @IsString()
  chan_name: string;

  @IsString()
  chan_id: string;

  @IsOptional()
  guest_id: string;
}
