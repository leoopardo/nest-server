import { IsAlpha, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty()
  @MaxLength(50)
  companyName: string;
  @IsAlpha()
  @MaxLength(15)
  subdomain: string;
  @IsEmail()
  @MaxLength(50)
  ownerEmail: string;
}
