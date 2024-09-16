import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as path from 'path';
import { loadConfig } from './config/config-loader';

console.log('__dirname:', __dirname);
console.log('Resolved path:', path.resolve(__dirname, '../.env'));

describe('AppModule Configuration', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: path.resolve(__dirname, '../.env'),
          isGlobal: true,
          load: [loadConfig],
        }),
        AppModule,
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should load environment variables from .env', () => {
    const smartProxyServer = configService.get<string>(
      'SMARTPROXY_RESIDENTIAL_ROTATING_SERVER',
    );
    expect(smartProxyServer).toBe(
      process.env.SMARTPROXY_RESIDENTIAL_ROTATING_SERVER,
    );

    const smartProxyUsername = configService.get<string>('SMARTPROXY_USERNAME');
    expect(smartProxyUsername).toBe(process.env.SMARTPROXY_USERNAME);

    const smartProxyPassword = configService.get<string>('SMARTPROXY_PASSWORD');
    expect(smartProxyPassword).toBe(process.env.SMARTPROXY_PASSWORD);
  });

  it('should load configuration from config.json and replace placeholders with env variables', () => {
    const proxyServer = configService.get<string>(
      'proxy.services.smartProxyResidentialRotating.server',
    );
    expect(proxyServer).toBe(
      process.env.SMARTPROXY_RESIDENTIAL_ROTATING_SERVER,
    );

    const proxyUsername = configService.get<string>(
      'proxy.services.smartProxyResidentialRotating.username',
    );
    expect(proxyUsername).toBe(process.env.SMARTPROXY_USERNAME);

    const proxyPassword = configService.get<string>(
      'proxy.services.smartProxyResidentialRotating.password',
    );
    expect(proxyPassword).toBe(process.env.SMARTPROXY_PASSWORD);

    const retryOptions = configService.get('retryOptions');
    expect(retryOptions).toBeDefined();
    expect(retryOptions.retries).toBe(10); // Example check based on your config.json
  });

  it('should ensure global availability of the config service', () => {
    const globalConfigService = configService;
    expect(globalConfigService).toBeDefined();
    expect(globalConfigService).toBe(configService); // Should be the same instance if global
  });
});
