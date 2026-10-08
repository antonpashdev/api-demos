import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { OAuthPracticeModule } from './oauth-practice/oauth-practice.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OAuthPracticeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
