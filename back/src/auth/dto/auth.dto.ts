import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  email: string;

  @IsString()
  @MaxLength(20)
  firstname: string;

  @IsString()
  @MaxLength(20)
  surname: string;

  avatar: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  nickname: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  password_confirm: string;
}
