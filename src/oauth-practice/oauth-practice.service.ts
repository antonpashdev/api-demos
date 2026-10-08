import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { AuthorizeCallbackParamsDto } from './dto/authorize-callback-params.dto.js';
import type { Response } from 'express';

@Injectable()
export class OAuthPracticeService {
  // Store state values in session
  stateStore = new Map();

  constructor(private readonly configService: ConfigService) { }

  login(res: Response) {
    const AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    const AUTH0_CLIENT_ID = this.configService.get<string>('AUTH0_CLIENT_ID');
    const REDIRECT_URI = this.configService.get<string>('REDIRECT_URI');
    const AUTH0_AUDIENCE = this.configService.get<string>('AUTH0_AUDIENCE');

    const state = crypto.randomBytes(32).toString('hex');
    const verifier = this.createCodeVerifier();
    this.stateStore.set(state, { timestamp: Date.now(), verifier });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: AUTH0_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'openid profile email',
      state,
      code_challenge: this.createCodeChallenge(verifier),
      code_challenge_method: 'S256',
      audience: AUTH0_AUDIENCE,
    } as Record<string, string>);

    res.redirect(
      `https://${AUTH0_DOMAIN}/authorize?${params.toString()}`
    );
  }

  async callback(params: AuthorizeCallbackParamsDto) {
    if (params.error) {
      throw new BadRequestException(`${params.error}. ${params.error_description}`);
    }

    if (!this.stateStore.has(params.state)) {
      throw new BadRequestException('Invalid state');
    }

    const { verifier } = this.stateStore.get(params.state);

    this.stateStore.delete(params.state);

    const AUTH0_DOMAIN = this.configService.get<string>('AUTH0_DOMAIN');
    const AUTH0_CLIENT_ID = this.configService.get<string>('AUTH0_CLIENT_ID');
    const AUTH0_CLIENT_SECRET = this.configService.get<string>('AUTH0_CLIENT_SECRET');
    const REDIRECT_URI = this.configService.get<string>('REDIRECT_URI');

    const response = await fetch(
      `https://${AUTH0_DOMAIN}/oauth/token`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },

        body: new URLSearchParams({
          grant_type: 'authorization_code',

          client_id: AUTH0_CLIENT_ID,
          client_secret: AUTH0_CLIENT_SECRET,

          code: params.code,

          redirect_uri: REDIRECT_URI,

          code_verifier: verifier,
        } as Record<string, string>),
      }
    );

    const tokens = await response.json();

    return tokens;
  }

  private base64url(buffer: Buffer) {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private createCodeVerifier() {
    return this.base64url(crypto.randomBytes(32));
  }

  private createCodeChallenge(verifier: string) {
    return this.base64url(
      crypto.createHash('sha256').update(verifier).digest()
    );
  }
}
