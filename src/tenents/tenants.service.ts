import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant, TenantDocument } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    return await this.tenantModel.create(createTenantDto);
  }

  async findBySubDomain(subdomain: string): Promise<Tenant> {
    return await this.tenantModel.findOne({ subdomain }).exec();
  }

  async findOne(params: {
    subdomain?: string;
    ownerEmail?: string;
  }): Promise<Tenant> {
    return await this.tenantModel
      .findOne({ subdomain: params?.subdomain, ownerEmail: params?.ownerEmail })
      .exec();
  }

  async update(
    subdomain: string,
    UpdateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    return await this.tenantModel.findOneAndUpdate(
      { subdomain },
      UpdateTenantDto,
    );
  }
}
