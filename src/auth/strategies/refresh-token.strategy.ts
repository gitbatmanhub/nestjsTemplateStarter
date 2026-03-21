import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request & { body?: { refreshToken?: string } }) =>
          request?.body?.refreshToken ?? null,
      ]),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(
    request: Request & {
      body?: { refreshToken?: string };
      refreshToken?: string;
    },
    payload: JwtPayload,
  ) {
    const refreshToken = request?.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    request.refreshToken = refreshToken;
    return this.authService.validateRefreshTokenUser(payload, refreshToken);
  }
}
