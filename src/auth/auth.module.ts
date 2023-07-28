import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountSettingsModule } from 'src/account-settings/account-settings.module';
import { AccountSettingsService } from 'src/account-settings/account-settings.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token-strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token-strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    AccountSettingsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    UsersService,
    AccountSettingsService,
  ],
})
export class AuthModule {}
