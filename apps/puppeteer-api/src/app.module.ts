import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { BrowserModule } from './browser/browser.module';
import { ProxyModule } from './proxy/proxy.module';
import { CommonModule } from './common/common.module';
import { RetryModule } from './retry/retry.module';
import * as path from 'path';
import { loadConfig } from './config/config-loader';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(__dirname, '../.env'),
      isGlobal: true,
      load: [loadConfig],
    }),
    PuppeteerModule,
    BrowserModule,
    ProxyModule,
    CommonModule,
    RetryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
