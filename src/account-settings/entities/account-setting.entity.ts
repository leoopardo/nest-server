import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { User } from 'src/users/entities/user.entity';

type AccountSettingsDocument = AccountSettings & Document;

@Schema({ timestamps: true })
class AccountSettings extends Document {
  @Prop({ required: true })
  companyName: string;
  @Prop({ required: true })
  subdomain: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  ownerUser: User;
  @Prop({ default: false })
  checkOptIn: boolean;
}

const AccountSettingsSchema = SchemaFactory.createForClass(AccountSettings);
AccountSettingsSchema.plugin(mongoosePaginate);
export { AccountSettings, AccountSettingsDocument, AccountSettingsSchema };
