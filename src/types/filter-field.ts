import { FieldType } from './field-type';
import { FilterOperator } from './filter-operator';

export interface FilterField {
  type: FieldType;
  name: string;
  operator: FilterOperator;
  value1: string;
  value2?: string;
}
