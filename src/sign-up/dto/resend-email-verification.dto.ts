import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class ResendEmailVerificationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  subdomain: string;
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  ownerEmail: string;
}
