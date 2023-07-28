// Essa entidade é dinamica
// Role API_TOKEN somente terá firstName, apiTokenSecret e apiToken
// Outras roles tem todos os outros campos menos os mencionados acima.
// -- ao logar um refresh token é expedido para o front e gravado em refresToken.. serve para o front relogar automaticamente.

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  RH = 'RH',
  EMPLOYEE = 'EMPLOYEE',
}

enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true })
class User extends Document {
  @Prop()
  email: string;
  @Prop({ required: true })
  firstName: string;
  @Prop()
  lastName: string;
  @Prop({ enum: Object.keys(UserRole), default: UserRole.EMPLOYEE })
  role: string;
  @Prop()
  @Exclude()
  password: string;
  @Prop()
  @Exclude()
  refreshTokenSecret: string;
  @Prop({ enum: Object.keys(UserStatus), default: UserStatus.PENDING })
  status: UserStatus;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } },
);

UserSchema.index(
  { firstName: 1 },
  {
    unique: true,
    // collation: { locale: 'en', strength: 2 },
  },
);

UserSchema.plugin(aggregatePaginate);
export { User, UserRole, UserSchema, UserStatus };
