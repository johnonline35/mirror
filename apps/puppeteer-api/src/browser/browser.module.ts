import { Module } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  providers: [BrowserService],
  exports: [BrowserService],
})
export class BrowserModule {}
