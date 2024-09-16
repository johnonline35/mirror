import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RetryService } from './retry.service';
import * as path from 'path';
import { loadConfig } from '../config/config-loader';

describe('RetryService', () => {
  let service: RetryService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: path.resolve(__dirname, '../../.env'),
          load: [loadConfig],
          isGlobal: true,
        }),
      ],
      providers: [RetryService],
    }).compile();

    service = module.get<RetryService>(RetryService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load config correctly', () => {
    const retryOptions = configService.get('retryOptions');
    expect(retryOptions).toBeDefined();
    expect(retryOptions.retries).toBe(10);
  });

  // More granular tests for specific environment variables
  it('should load SMARTPROXY_SERVER correctly', () => {
    const smartProxyServer = configService.get<string>(
      'proxy.services.smartProxyResidentialRotating.server',
    );
    expect(smartProxyServer).toBe(
      process.env.SMARTPROXY_RESIDENTIAL_ROTATING_SERVER,
    );
  });

  it('should load SMARTPROXY_USERNAME correctly', () => {
    const smartProxyUsername = configService.get<string>(
      'proxy.services.smartProxyResidentialRotating.username',
    );
    expect(smartProxyUsername).toBe(process.env.SMARTPROXY_USERNAME);
  });

  it('should load SMARTPROXY_PASSWORD correctly', () => {
    const smartProxyPassword = configService.get<string>(
      'proxy.services.smartProxyResidentialRotating.password',
    );
    expect(smartProxyPassword).toBe(process.env.SMARTPROXY_PASSWORD);
  });

  it('should load OTHER_PROXY_SERVER correctly', () => {
    const otherProxyServer = configService.get<string>(
      'proxy.services.otherProxyService.server',
    );
    expect(otherProxyServer).toBe('otherproxy.server.com:9000');
  });

  it('should load OTHER_PROXY_USERNAME correctly', () => {
    const otherProxyUsername = configService.get<string>(
      'proxy.services.otherProxyService.username',
    );
    expect(otherProxyUsername).toBe('otherproxy-username');
  });

  it('should load OTHER_PROXY_PASSWORD correctly', () => {
    const otherProxyPassword = configService.get<string>(
      'proxy.services.otherProxyService.password',
    );
    expect(otherProxyPassword).toBe('otherproxy-password');
  });

  it('should load MY_OWN_IP_RANGE_PRIORITY correctly', () => {
    const myOwnIPRangePriority = configService.get<number>(
      'proxy.services.myOwnIPRange.priority',
    );
    expect(myOwnIPRangePriority).toBe(3);
  });
});
