import { IsString, MaxLength, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChanFormDataDto {
  @IsString()
  @MaxLength(12)
  chan_name: string;

  @IsString()
  chan_pwd: string;

  @IsString()
  chan_topic: string;

  @IsNumber()
  chan_type: number;
}
export class CreateChannelDto {
  @ValidateNested()
  @Type(() => ChanFormDataDto)
  formData: ChanFormDataDto;

  @IsString()
  userid: string;
}

export class ChanNameDto {
  @IsString()
  @MaxLength(12)
  chan_name: string;
}
