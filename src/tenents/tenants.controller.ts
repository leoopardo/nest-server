import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenentsController {
  constructor(private readonly tenentsService: TenantsService) {}

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenentsService.create(createTenantDto);
  }

  @Get(':subdomain')
  findOne(@Param('subdomain') subdomain: string) {
    return this.tenentsService.findBySubDomain(subdomain);
  }
}
