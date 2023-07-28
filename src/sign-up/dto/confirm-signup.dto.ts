import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class ConfirmSignUpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  subdomain: string;
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;
}
