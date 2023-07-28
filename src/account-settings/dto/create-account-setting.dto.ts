import {
  IsAlpha,
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class AccountSettingsDto {
  @IsNotEmpty()
  @IsAlpha()
  subdomain: string;
  @IsNotEmpty()
  @MaxLength(50)
  companyName: string;
  @IsString()
  @MaxLength(50)
  ownerUser: string;
  @IsBoolean()
  checkOptIn: boolean;
}
