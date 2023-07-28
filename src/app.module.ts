import { TenancyModule } from '@needle-innovision/nestjs-tenancy';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { TenantsModule } from './tenents/tenants.module';
import { TenantsValidator } from './tenents/tenants.validator';
import { SignUpModule } from './sign-up/sign-up.module';
import { AccountSettingsModule } from './account-settings/account-settings.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
});

const mongooseModule = MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get('database.host'),
  }),
  inject: [ConfigService],
});

const tenancyModule = TenancyModule.forRootAsync({
  imports: [TenantsModule],
  useFactory: async (
    configService: ConfigService,
    TenantValidator: TenantsValidator,
  ) => {
    return {
      isTenantFromSubdomain: true,
      uri: (tenantId: string) => {
        return `${configService.get(
          'database.host',
        )}/tenant-${tenantId}?authSource=admin`;
      },
      validator: (tenantId: string) => TenantValidator.setTenantId(tenantId),
    };
  },
  inject: [ConfigService, TenantsValidator],
});
const mailerModule = MailerModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    return {
      transport: {
        host: configService.get('smtp.host'),
        port: configService.get('smtp.port'),
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: configService.get('smtp.keyId'),
          pass: configService.get('smtp.keySecret'),
        },
      },
      defaults: {
        from: `ktp-registry@${configService.get('smtp.domain')}`,
      },
      template: {
        // dir: process.cwd() + '/src/email-templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  },
  inject: [ConfigService],
});

@Module({
  imports: [
    configModule,
    mongooseModule,
    tenancyModule,
    mailerModule,
    SignUpModule,
    AccountSettingsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
