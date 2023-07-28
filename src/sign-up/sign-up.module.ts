import { Module } from '@nestjs/common';
import { SignUpService } from './sign-up.service';
import { SignUpController } from './sign-up.controller';
import { TenantsModule } from 'src/tenents/tenants.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TenantsModule, JwtModule.register({})],
  controllers: [SignUpController],
  providers: [SignUpService],
})
export class SignUpModule {}
