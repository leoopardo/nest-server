import { IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateAccountSettingsDto {
  @IsNotEmpty()
  @MaxLength(50)
  companyName: string;
  @IsBoolean()
  checkOptIn: boolean;
}
