import { Aggregate } from 'mongoose';
import { FilterField } from 'src/types/filter-field';
import { FieldType } from 'src/types/field-type';
import { FilterOperator } from 'src/types/filter-operator';
import { getTypedValue } from './get-typed-value';

// function getObject(key, value) {
//   let object = {};
//   const result = object;
//   const paths = key.split('.');
//   for (let index = 0; index < paths.length - 1; index++) {
//     object = object[`${paths[index]}`] = {};
//   }
//   object[paths[paths.length - 1]] = value;
//   return result;
// }

export function getPipelineStage(
  aggregate: Aggregate<any[]>,
  filter: FilterField,
) {
  switch (filter.operator) {
    case FilterOperator.CONTAINS:
      aggregate.match({
        [`${filter.name}`]: new RegExp(
          filter.value1.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
          'i',
        ),
      });
      break;

    case FilterOperator.EQUALS:
      aggregate.match({
        [`${filter.name}`]: getTypedValue(
          FieldType[filter.type],
          filter.value1,
        ),
      });
      break;
    case FilterOperator.NOT_EQUALS:
      aggregate.match({
        [`${filter.name}`]: {
          $ne: getTypedValue(FieldType[filter.type], filter.value1),
        },
      });
      break;
    case FilterOperator.BETWEEN:
      aggregate.match({
        [`${filter.name}`]: {
          $gte: getTypedValue(FieldType[filter.type], filter.value1),
          $lte: getTypedValue(FieldType[filter.type], filter.value2),
        },
      });
      break;
    case FilterOperator.IN:
      aggregate.match({
        [`${filter.name}`]: {
          $in: filter.value1.split(',').map((val) => {
            return getTypedValue(FieldType[filter.type], val);
          }),
        },
      });
  }
}
