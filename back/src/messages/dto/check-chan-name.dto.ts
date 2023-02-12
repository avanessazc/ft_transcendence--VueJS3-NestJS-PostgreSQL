import {
  IsString,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PPChanFormDataDto {
  @IsString()
  @MinLength(8)
  chan_pwd: string;
}

export class PPChanFormDataNoMinLengthDto {
  @IsString()
  chan_pwd: string;
}

export class PPChannelDto {
  @ValidateNested()
  @Type(() => PPChanFormDataDto)
  pp_formData: PPChanFormDataDto;

  @IsString()
  @MaxLength(12)
  chan_name: string;

  @IsString()
  userid: string;
}

export class PPChannelNoMinMaxLengthDto {
  @ValidateNested()
  @Type(() => PPChanFormDataNoMinLengthDto)
  pp_formData: PPChanFormDataNoMinLengthDto;

  @IsString()
  chan_name: string;

  @IsString()
  userid: string;
}

export class ChanNameNoMaxLengthDto {
  @IsString()
  chan_name: string;
}
