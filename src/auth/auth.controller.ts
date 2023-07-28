import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { User } from 'src/users/entities/user.entity';
import { UserDecorator } from 'src/users/user.decorator';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/Auth.dto';
import { RequestNewPasswordDto } from './dto/RequestNewPassword.dto';
import { SetNewPasswordDto } from './dto/SetNewPassword.dto';
import { JwtRefreshTokenAuthGuard } from './guards/jwt-refresh-token-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() authDto: AuthDto) {
    return this.authService.signIn(authDto);
  }

  @UseGuards(JwtRefreshTokenAuthGuard)
  @Post('refresh-tokens')
  async refreshTokens(@UserDecorator() user: User) {
    return this.authService.refreshTokens(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() requestNewPasswordDto: RequestNewPasswordDto) {
    return this.authService.forgotPassword(requestNewPasswordDto.email);
  }

  @Get('check-token')
  async checkToken(@Query('token') token: string) {
    return await this.authService.confirmationTokenValid(token);
  }

  @UseInterceptors(
    new SanitizeMongooseModelInterceptor({
      excludeMongooseId: false,
      excludeMongooseV: false,
    }),
  )
  @Post('set-new-password')
  async setNewPassword(@Body() setNewPasswordDto: SetNewPasswordDto) {
    return await this.authService.setNewPassword(setNewPasswordDto);
  }
}
