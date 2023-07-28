import { TenancyValidator } from '@needle-innovision/nestjs-tenancy';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from './entities/tenant.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TenantStatus } from './types/tenantStatus';

@Injectable()
export class TenantsValidator implements TenancyValidator {
  private _tenantId: string;
  constructor(
    @InjectModel('Tenant') private tenantModel: Model<Tenant>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  checkTenantId(tenantId: string): string {
    let _tenantId = tenantId;

    let message;
    if (tenantId.includes('Bearer')) {
      let payload;
      try {
        payload = this.jwtService.verify(tenantId.replace('Bearer ', ''), {
          secret: this.configService.get('jwt.accessTokenSecret'),
          ignoreExpiration: true,
        });
      } catch (error) {
        message = error.message;
      }

      if (!payload) {
        try {
          payload = this.jwtService.verify(tenantId.replace('Bearer ', ''), {
            secret: this.configService.get('jwt.refreshTokenSecret'),
            // ignoreExpiration: true,
          });
        } catch (error) {
          message = error.message;
        }
      }
      if (!payload) {
        try {
          payload = this.jwtService.verify(tenantId.replace('Bearer ', ''), {
            secret: this.configService.get('jwt.confirmationTokenSecret'),
            // ignoreExpiration: true,
          });
        } catch (error: any) {
          message = error.message;
        }
      }

      if (!payload) throw new UnauthorizedException(message);
      _tenantId = payload['subdomain'];
    }

    return _tenantId;
  }

  setTenantId(tenantId: string): TenancyValidator {
    this._tenantId = this.checkTenantId(tenantId);
    return this;
  }

  async validate(): Promise<void> {
    const tenant = await this.tenantModel.findOne({
      subdomain: this._tenantId,
    });
    if (!tenant || tenant.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedException('Tenant not found or inactive.');
    }
  }
}
