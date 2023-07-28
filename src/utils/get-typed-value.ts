import mongoose from 'mongoose';
import { FieldType } from 'src/types/field-type';

export function getTypedValue(type: FieldType, value: string) {
  switch (type) {
    case FieldType.BOOLEAN:
      return value === 'true';
    case FieldType.STRING:
      return value;
    case FieldType.OBJECTID:
      return new mongoose.Types.ObjectId(value);
    case FieldType.DATE:
      return new Date(value);
  }
}
