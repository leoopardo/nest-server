import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SetNewPasswordDto {
  @IsNotEmpty()
  @IsString()
  id: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
