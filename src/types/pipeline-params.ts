import { Aggregate } from 'mongoose';
import { FilterField } from 'src/types/filter-field';
import { Lookup } from 'src/types/lookup';
import { SortField } from 'src/types/sort-field';

export interface PipelineParams {
  pipeline: Aggregate<any[]>;
  lookups?: Lookup[];
  filters?: FilterField[];
  sorts?: SortField[];
}
