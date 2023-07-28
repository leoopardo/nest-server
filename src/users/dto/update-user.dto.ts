import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
  @IsOptional()
  @IsString()
  role?: string;
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password?: string;
  @IsOptional()
  @IsString()
  status?: string;
}
