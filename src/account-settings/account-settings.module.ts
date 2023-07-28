import { Module } from '@nestjs/common';
import { AccountSettingsService } from './account-settings.service';
import { AccountSettingsController } from './account-settings.controller';
import { JwtModule } from '@nestjs/jwt';
import {
  AccountSettings,
  AccountSettingsSchema,
} from './entities/account-setting.entity';
import { TenancyModule } from '@needle-innovision/nestjs-tenancy';

@Module({
  imports: [
    TenancyModule.forFeature([
      { name: AccountSettings.name, schema: AccountSettingsSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [AccountSettingsController],
  providers: [AccountSettingsService],
  exports: [AccountSettingsService],
})
export class AccountSettingsModule {}
