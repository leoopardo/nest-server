import { InjectTenancyModel } from '@needle-innovision/nestjs-tenancy';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as Mailgen from 'mailgen';
import { AggregatePaginateModel } from 'mongoose';
import { AccountSettingsService } from 'src/account-settings/account-settings.service';
import { QueryDto } from 'src/types/query.dto';
import { getPipeline } from 'src/utils/get-pipeline';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectTenancyModel(User.name)
    private readonly model: AggregatePaginateModel<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly accountSettingsService: AccountSettingsService,
  ) {}

  async create(userDto: CreateUserDto) {
    const user = await this.model.create(userDto);
    const as = await this.accountSettingsService.get();
    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.confirmationTokenSecret'),
      expiresIn: '1d',
    });
    await this.sendEmail(as.subdomain, userDto.firstName, userDto.email, token);
    return user;
  }

  async reSendEmailActivation(id: string) {
    const user = await this.model.findById(id);
    const as = await this.accountSettingsService.get();
    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.confirmationTokenSecret'),
      expiresIn: '1d',
    });
    await this.sendEmail(as.subdomain, user.firstName, user.email, token);
  }

  async updateRefreshToken(id: string, refreshTokenSecret: string) {
    return await this.model.findByIdAndUpdate(id, { refreshTokenSecret });
  }

  async findAll(query: QueryDto) {
    const { perPage, page, filters } = query;

    const options = {
      limit: perPage,
      page: page,
      sort: { createdAt: -1 },
    };

    const pipeline = this.model.aggregate();
    if (filters) getPipeline({ pipeline, filters });
    pipeline.project({ password: 0, refreshApiToken: 0, apiTokenSecret: 0 });

    return await this.model.aggregatePaginate(pipeline, options);
  }

  async findOne(email: string) {
    return await this.model.findOne({ email }).exec();
  }

  async findById(id: string) {
    return await this.model.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.model
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.model.findById(id);
    const passwordMatches = await argon2.verify(
      user.password,
      changePasswordDto.currentPassword,
    );
    if (!passwordMatches)
      throw new BadRequestException('Current password does not match!');
    const password = await argon2.hash(changePasswordDto.newPassword);
    return await this.model.findByIdAndUpdate(id, { password }, { new: true });
  }

  async remove(id: string) {
    const as = await this.accountSettingsService.get();

    if (as.ownerUser.toString() === id) {
      throw new ForbiddenException("Can't delete the account owner.");
    }

    return await this.model.findByIdAndDelete(id);
  }

  async sendEmail(subdomain, firstName, email, token) {
    // Configure mailgen by setting a theme and your product info
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
    )}://${subdomain}.${this.configService.get(
      'frontEnd.host',
    )}/auth/set-new-password/${token}`;

    const emailContent = {
      body: {
        name: firstName,
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

    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(emailContent);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = mailGenerator.generatePlaintext(emailContent);

    await this.mailerService.sendMail({
      to: email,
      from: `${this.configService.get('smtp.domain')}`,
      subject: 'Growp - Ativação de conta',
      text: emailText,
      html: emailBody,
    });
  }
}
