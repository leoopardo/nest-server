import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class ConfirmUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).*$/)
  password: string;
}
