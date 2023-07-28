import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as Mailgen from 'mailgen';
import { AccountSettingsService } from 'src/account-settings/account-settings.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User, UserStatus } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/Auth.dto';
import { SetNewPasswordDto } from './dto/SetNewPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly accountSettingsService: AccountSettingsService,
    private readonly mailerService: MailerService,
  ) {}

  async signIn(authDto: AuthDto) {
    const user = await this.usersService.findOne(authDto.email);

    if (!user) throw new UnauthorizedException();

    if (user.password.startsWith('$2')) {
      const match = await bcrypt.compare(authDto.password, user.password);
      if (!match) throw new UnauthorizedException();

      // rehash password with argon2 and save to database
      user.password = await argon2.hash(authDto.password);
      await user.save();
    } else {
      const match = await argon2.verify(user.password, authDto.password);
      if (!match) throw new UnauthorizedException();
    }

    const accessToken = await this.getAccessToken(user);
    const refreshToken = await this.getRefreshToken(user);

    return {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accessToken,
      refreshToken,
    };
  }

  async getAccessToken(user: User) {
    const jwtPayload = {
      // subdomain,
      id: user._id,
      email: user.email,
    };

    return await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('jwt.accessTokenSecret'),
      expiresIn: '15m',
    });
  }

  async getRefreshToken(user: User) {
    const secret = crypto.randomBytes(64).toString('hex');
    const jwtPayload = {
      id: user._id,
      email: user.email,
      secret,
    };

    const rt = await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('jwt.refreshTokenSecret'),
      expiresIn: '7d',
    });

    await this.usersService.updateRefreshToken(
      user._id,
      await argon2.hash(secret),
    );
    return rt;
  }

  async refreshTokens(user: User) {
    const accessToken = await this.getAccessToken(user);

    return {
      accessToken,
    };
  }

  async forgotPassword(email: string) {
    const as = await this.accountSettingsService.get();
    const user = await this.usersService.findOne(email);
    if (!user || user.status === UserStatus.INACTIVE) {
      return;
    }
    const payload = { subdomain: as.subdomain, id: user._id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.confirmationTokenSecret'),
      expiresIn: '15m',
    });

    // Configure mailgen by setting a theme and your product info
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        // Appears in header & footer of e-mails
        name: 'Growp',
        link: 'http://localhost:3000',
        // Optional logo
        // logo: 'https://mailgen.js/img/logo.png'
      },
    });

    const link = `${this.configService.get('frontEnd.protocol')}://${
      as.subdomain
    }.${this.configService.get(
      'frontEnd.host',
    )}/auth/set-new-password/${token}`;

    // Prepare email contents
    const emailContent = {
      body: {
        name: user.firstName,
        intro:
          'Você recebeu este email por causa da sua solicitação de mudança de senha',
        action: {
          instructions: 'Mude sua senha pelo botão abaixo',
          button: {
            color: '#DC4D2F',
            text: 'Mudar senha',
            link,
          },
        },
        outro: 'Se você não solicitou uma mudança de senha, ignore este email',
      },
    };

    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(emailContent);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = mailGenerator.generatePlaintext(emailContent);

    this.mailerService.sendMail({
      to: user.email,
      from: `${this.configService.get('smtp.domain')}`,
      subject: 'Growp - Mudar senha',
      text: emailText,
      html: emailBody,
    });
  }

  async setNewPassword(setNewPasswordDto: SetNewPasswordDto) {
    const updateUserDto: UpdateUserDto = {
      password: await argon2.hash(setNewPasswordDto.password),
      status: UserStatus.ACTIVE,
    };
    return await this.usersService.update(setNewPasswordDto.id, updateUserDto);
  }

  async confirmationTokenValid(token: string) {
    const payload = await this.jwtService.verify(token, {
      secret: this.configService.get('jwt.confirmationTokenSecret'),
    });

    if (payload) return payload;
  }
}
