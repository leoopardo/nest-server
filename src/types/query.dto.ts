import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { FilterField } from 'src/types/filter-field';
import { Lookup } from './lookup';
import { SortField } from './sort-field';

export class QueryDto {
  @IsNumber()
  @Transform(({ value }) => {
    return +value;
  })
  perPage = 0;

  @IsNumber()
  @Transform(({ value }) => {
    return +value;
  })
  page = 1;

  @IsOptional()
  lookups?: Lookup[];

  @IsOptional()
  filters?: FilterField[];

  @IsOptional()
  sorts?: SortField[];
}
