import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as Mailgen from 'mailgen';
import * as mongoose from 'mongoose';
import { AccountSettingsSchema } from 'src/account-settings/entities/account-setting.entity';
import { Tenant } from 'src/tenents/entities/tenant.entity';
import { TenantsService } from 'src/tenents/tenants.service';
import { TenantStatus } from 'src/tenents/types/TenantStatus';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import {
  UserRole,
  UserSchema,
  UserStatus,
} from 'src/users/entities/user.entity';
import { ResendEmailVerificationDto } from './dto/resend-email-verification.dto';
import { SingUpDto } from './dto/sign-up.dto';
import { AccountSettingsDto } from 'src/account-settings/dto/create-account-setting.dto';
import { ConfirmSignUpDto } from './dto/confirm-signup.dto';

@Injectable()
export class SignUpService {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async signUp(signUpData: SingUpDto): Promise<Tenant> {
    const tenant = await this.tenantsService.create(signUpData);

    const payload = {
      subdomain: tenant.subdomain,
      firstName: tenant.ownerFirstName,
      lastName: tenant.ownerLastName,
      email: tenant.ownerEmail,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.ConfirmationTokenSecret'),
      expiresIn: '60m',
    });

    await this.sendEmail(
      signUpData.ownerFirstName,
      signUpData.ownerEmail,
      token,
    );

    return tenant;
  }

  async sendEmail(ownerFirstName, ownerEmail, token) {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        // Appears in header & footer of e-mails
        name: 'Growp - fast portal',
        link: 'http://localhost:3000',
        // Optional logo
        // logo: 'https://mailgen.js/img/logo.png'
      },
    });
    const link = `${this.configService.get(
      'frontEnd.protocol',
    )}://${this.configService.get('frontEnd.host')}/sign-up/confirm/${token}`;

    const emailContent = {
      body: {
        name: ownerFirstName,
        intro: 'Bem vindo à Growp. Estamos muito animados em ter você a bordo',
        action: {
          instructions: 'Para começar, confire sua conta abaixo.',
          button: {
            color: '#22BC66', // Optional action button color
            text: 'Confirmar conta',
            link,
          },
        },
        outro:
          'Se você não solicitou este email, não é necessário realizar nenhuma ação.',
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const emailText = mailGenerator.generatePlaintext(emailContent);

    this.mailerService.sendMail({
      to: ownerEmail,
      from: `${this.configService.get('smtp.domain')}`,
      subject: 'Growp - Ativação de conta',
      text: emailText,
      html: emailBody,
    });
  }

  async confirmationTokenValid(token: string) {
    const payload = await this.decodeConfirmationToken(token);

    const tenant = await this.tenantsService.findBySubDomain(payload.subdomain);
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (tenant.status === TenantStatus.ACTIVE) {
      throw new BadRequestException('Tenant already confirmed');
    }

    if (payload) return payload;
  }

  async resendEmailVerification(
    resendEmailVerificationDto: ResendEmailVerificationDto,
  ) {
    const tenant = await this.tenantsService.findOne(
      resendEmailVerificationDto,
    );
    if (!tenant || tenant.status === TenantStatus.INACTIVE) {
      throw new NotFoundException();
    }
    const payload = {
      subdomain: tenant.subdomain,
      firstName: tenant.ownerFirstName,
      lastName: tenant.ownerLastName,
      email: tenant.ownerEmail,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.confirmationTokenSecret'),
      expiresIn: '15m',
    });

    await this.sendEmail(tenant.ownerFirstName, tenant.ownerEmail, token);
  }

  async confirm(confirmSignUpDto: ConfirmSignUpDto) {
    const tenant = await this.tenantsService.findBySubDomain(
      confirmSignUpDto.subdomain,
    );

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (tenant.status === TenantStatus.ACTIVE) {
      throw new BadRequestException('Tenant already confirmed');
    }

    const conn = await mongoose.createConnection(
      `${this.configService.get('database.host')}/tenant-${
        tenant.subdomain
      }?authSource=admin`,
    );

    try {
      const AccountSettingsModel = conn.model(
        'AccountSettings',
        AccountSettingsSchema,
      );
      const UserModel = conn.model('User', UserSchema);

      const _user: CreateUserDto = {
        email: tenant.ownerEmail,
        firstName: confirmSignUpDto.firstName,
        lastName: confirmSignUpDto.lastName,
        role: UserRole.ADMINISTRATOR,
        password: await argon2.hash(confirmSignUpDto.password),
        status: UserStatus.ACTIVE,
      };
      const user = await UserModel.create(_user);

      const accountSettings: AccountSettingsDto = {
        companyName: tenant.companyName,
        subdomain: tenant.subdomain,
        ownerUser: user._id.toString(),
        checkOptIn: false,
      };
      await AccountSettingsModel.create(accountSettings);
    } finally {
      await conn.close();
    }
  }

  async decodeConfirmationToken(token: string) {
    const payload = await this.jwtService.verify(token, {
      secret: this.configService.get('jwt.confirmationTokenSecret'),
    });
    return payload;
  }
}
