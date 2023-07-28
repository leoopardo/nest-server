import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAccessTokenAuthGuard } from 'src/auth/guards/jwt-access-token-auth.guard';
import { QueryDto } from 'src/types/query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ResendEmailDto } from './dto/resend-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { UserDecorator } from './user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAccessTokenAuthGuard)
  @Post()
  async create(@Body() userDto: CreateUserDto) {
    return await this.usersService.create(userDto);
  }

  @UseGuards(JwtAccessTokenAuthGuard)
  @Post('resend-email')
  async reSendEmailActivation(@Body() dto: ResendEmailDto) {
    return await this.usersService.reSendEmailActivation(dto.id);
  }

  @UseInterceptors(
    new SanitizeMongooseModelInterceptor({
      excludeMongooseId: false,
      excludeMongooseV: false,
    }),
  )
  @UseGuards(JwtAccessTokenAuthGuard)
  @UseGuards(JwtAccessTokenAuthGuard)
  @Get('/me')
  getMe(@UserDecorator() user: User) {
    return user;
  }

  // como usa mongoose aggregate paginate, o intercept abaixo n funciona
  // entao pra excluir o password, no pipeline, sera removido - ver no service.
  // @UseGuards(JwtAccessTokenAuthGuard)
  // @UseInterceptors(
  //   new SanitizeMongooseModelInterceptor({
  //     excludeMongooseId: false,
  //     excludeMongooseV: false,
  //   }),
  // )
  @UseGuards(JwtAccessTokenAuthGuard)
  @Get()
  async findAll(@Query() query: QueryDto) {
    return await this.usersService.findAll(query);
  }

  @UseInterceptors(
    new SanitizeMongooseModelInterceptor({
      excludeMongooseId: false,
      excludeMongooseV: false,
    }),
  )
  @UseGuards(JwtAccessTokenAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @UseInterceptors(
    new SanitizeMongooseModelInterceptor({
      excludeMongooseId: false,
      excludeMongooseV: false,
    }),
  )
  @UseGuards(JwtAccessTokenAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseInterceptors(
    new SanitizeMongooseModelInterceptor({
      excludeMongooseId: false,
      excludeMongooseV: false,
    }),
  )
  @UseGuards(JwtAccessTokenAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @UseInterceptors(
    new SanitizeMongooseModelInterceptor({
      excludeMongooseId: false,
      excludeMongooseV: false,
    }),
  )
  @UseGuards(JwtAccessTokenAuthGuard)
  @Patch(':id/changePassword')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.usersService.changePassword(id, changePasswordDto);
  }
}
