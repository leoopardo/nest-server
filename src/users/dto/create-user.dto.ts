import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: string;
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;
  @IsString()
  role: string;
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
  @IsOptional()
  status: string;
}
