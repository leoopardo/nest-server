import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantStatus } from '../types/tenantStatus';

export type TenantDocument = Tenant & Document;

export class Tenant extends Document {
  @Prop({ required: true })
  companyName: string;
  @Prop({ required: true, unique: true })
  subdomain: string;
  @Prop({ required: true })
  ownerFirstName: string;
  @Prop({ required: true })
  ownerLastName: string;
  @Prop({ required: true, unique: true })
  ownerEmail: string;
  @Prop({ enum: Object.keys(TenantStatus), default: TenantStatus.PENDING })
  status: TenantStatus;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
