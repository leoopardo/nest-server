import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private moduleRef: ModuleRef,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('jwt.accessTokenSecret'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    const contextID = ContextIdFactory.getByRequest(request);
    this.jwtService.verify(
      request.headers['authorization'].replace('Bearer ', ''),
      {
        secret: this.configService.get('jwt.accessTokenSecret'),
        ignoreExpiration: false,
      },
    );
    const usersService = await this.moduleRef.resolve(UsersService, contextID);
    const user = await usersService.findById(payload.id);
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
