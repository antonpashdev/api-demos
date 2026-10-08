import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { OAuthPracticeService } from './oauth-practice.service.js';
import { AuthorizeCallbackParamsDto } from './dto/authorize-callback-params.dto.js';
import type { Response, Request } from 'express';
import { AuthGuard } from './guards/auth.guard.js';

@Controller('oauth-practice')
export class OAuthPracticeController {
  constructor(private readonly oauthPracticeService: OAuthPracticeService) {}

  @Get('login')
  login(@Res() res: Response) {
    return this.oauthPracticeService.login(res);
  }

  @Get('callback')
  callback(@Query() params: AuthorizeCallbackParamsDto) {
    return this.oauthPracticeService.callback(params);
  }

  @Get('api/private')
  @UseGuards(AuthGuard)
  handlePrivate(@Req() req: Request) {
    return {
      message: 'Secret data',
      user: req.user?.sub,
    };
  }
}
