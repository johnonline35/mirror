import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// this is a simple service that reads the proxy configuration from the config service
// TODO: implement a more complex service that rotates proxies

@Injectable()
export class ProxyService {
  constructor(private readonly configService: ConfigService) {}

  getProxyConfig() {
    const proxyServiceName = 'smartProxyResidentialRotating'; // only one for now

    const proxyConfig = this.configService.get<any>(
      `proxy.services.${proxyServiceName}`,
    );

    return {
      server: proxyConfig.server,
      credentials: {
        username: proxyConfig.username,
        password: proxyConfig.password,
        priority: proxyConfig.priority,
      },
    };
  }
}
