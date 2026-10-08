import { Module } from '@nestjs/common';
import { OAuthPracticeController } from './oauth-practice.controller.js';
import { OAuthPracticeService } from './oauth-practice.service.js';

@Module({
  controllers: [OAuthPracticeController],
  providers: [OAuthPracticeService],
})
export class OAuthPracticeModule { };