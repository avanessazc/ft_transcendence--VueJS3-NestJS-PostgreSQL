import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UserIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  firstname: string;

  @IsString()
  surname: string;

  avatar: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  nickname: string;

  @IsString()
  old_password: string;

  @IsString()
  password: string;

  @IsString()
  password_confirm: string;

  deleted_avatar: boolean;
}
