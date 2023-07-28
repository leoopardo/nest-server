import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenentsController } from './tenants.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './entities/tenant.entity';
import { JwtModule } from '@nestjs/jwt';
import { TenantsValidator } from './tenants.validator';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    JwtModule.register({}),
  ],
  controllers: [TenentsController],
  providers: [TenantsService, TenantsValidator],
  exports: [TenantsService, TenantsValidator],
})
export class TenantsModule {}
