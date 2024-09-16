import * as fs from 'fs';
import * as path from 'path';

export function loadConfig() {
  const configPath = path.resolve(__dirname, './config.json');
  const configFile = fs.readFileSync(configPath, 'utf-8');

  const configWithEnv = configFile.replace(/\$\{(\w+)\}/g, (_, name) => {
    return process.env[name] || '';
  });

  return JSON.parse(configWithEnv);
}
