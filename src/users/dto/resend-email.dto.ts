import { IsMongoId } from 'class-validator';

export class ResendEmailDto {
  @IsMongoId()
  id: string;
}
