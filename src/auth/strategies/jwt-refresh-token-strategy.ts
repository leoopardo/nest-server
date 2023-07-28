import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import * as argon2 from 'argon2';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private moduleRef: ModuleRef,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('jwt.refreshTokenSecret'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    const contextID = ContextIdFactory.getByRequest(request);
    this.jwtService.verify(
      request.headers['authorization'].replace('Bearer ', ''),
      {
        secret: this.configService.get('jwt.refreshTokenSecret'),
        ignoreExpiration: false,
      },
    );
    const usersService = await this.moduleRef.resolve(UsersService, contextID);
    const user = await usersService.findById(payload.id);

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      !(await argon2.verify(user.refreshTokenSecret, payload.secret))
    )
      throw new UnauthorizedException('Invalid refresh token');

    return user;
  }
}
