import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
export class SingUpDto {
  @IsNotEmpty()
  @MaxLength(50)
  companyName: string;
  @IsAlpha()
  @MaxLength(15)
  subdomain: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  ownerFirstName: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  ownerLastName: string;
  @IsEmail()
  @MaxLength(50)
  ownerEmail: string;
}
