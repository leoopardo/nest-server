import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TenancyModule } from '@needle-innovision/nestjs-tenancy';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AccountSettingsModule } from 'src/account-settings/account-settings.module';

@Module({
  imports: [
    TenancyModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
    AccountSettingsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
