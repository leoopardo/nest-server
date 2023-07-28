import { InjectTenancyModel } from '@needle-innovision/nestjs-tenancy';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { UpdateAccountSettingsDto } from './dto/update-account-setting.dto';
import {
  AccountSettings,
  AccountSettingsDocument,
} from './entities/account-setting.entity';

@Injectable()
export class AccountSettingsService {
  constructor(
    @InjectTenancyModel(AccountSettings.name)
    private readonly accountSettingsModel: Model<AccountSettingsDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async get() {
    return await this.accountSettingsModel.findOne().exec();
  }

  async update(
    updateAccountSettingsDto: UpdateAccountSettingsDto,
  ): Promise<AccountSettings> {
    return await this.accountSettingsModel
      .findOneAndUpdate({}, updateAccountSettingsDto, { new: true })
      .exec();
  }

  async regenerate(): Promise<AccountSettings> {
    const { subdomain } = await this.accountSettingsModel.findOne({}).exec();
    const secret = randomUUID();

    const token = this.jwtService.sign({ subdomain, secret });

    return await this.accountSettingsModel
      .findOneAndUpdate(
        {},
        {
          secret,
          apiToken: token,
        },
        { new: true },
      )
      .exec();
  }
}
