import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ConfirmSignUpDto } from './dto/confirm-signup.dto';
import { SingUpDto } from './dto/sign-up.dto';
import { SignUpService } from './sign-up.service';
import { ResendEmailVerificationDto } from './dto/resend-email-verification.dto';

@Controller('sign-up')
export class SignUpController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post()
  async signUp(@Body() signUpDto: SingUpDto) {
    return await this.signUpService.signUp(signUpDto);
  }

  @Get('check-token')
  async checkToken(@Query('token') token: string) {
    return await this.signUpService.confirmationTokenValid(token);
  }

  @Post('confirm')
  async confirm(@Body() confirmSignUpDto: ConfirmSignUpDto) {
    return await this.signUpService.confirm(confirmSignUpDto);
  }

  @Post('redo')
  async resendEmailVerification(
    @Body() resendEmailVerificationDto: ResendEmailVerificationDto,
  ) {
    return await this.signUpService.resendEmailVerification(
      resendEmailVerificationDto,
    );
  }
}
