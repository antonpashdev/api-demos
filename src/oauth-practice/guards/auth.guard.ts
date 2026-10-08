import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) { }

  async canActivate(
    context: ExecutionContext,
  ) {
    const req = context.switchToHttp().getRequest();

    const AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    const AUTH0_AUDIENCE = this.configService.get<string>('AUTH0_AUDIENCE');

    const JWKS = createRemoteJWKSet(
      new URL(
        `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
      )
    );

    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token = authorization.substring(7);

    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `https://${AUTH0_DOMAIN}/`,
        audience: AUTH0_AUDIENCE,
      });

      req.user = payload;

      return true;
    } catch (error) {
      console.error(error);

      throw new UnauthorizedException();
    }
  }
}
