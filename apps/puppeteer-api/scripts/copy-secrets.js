/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync, writeFileSync } = require('fs');
const dotenv = require('dotenv');

const run = async () => {
  // const configName = process.argv.pop().replace('--', '');
  // const srcSecretsJsonPath = __dirname + `/../.env.secrets.${configName}`;
  // const secretsJson = dotenv.parse(readFileSync(srcSecretsJsonPath));
  // const distSecretsJsonPath = __dirname + `/../server/.env.secrets.json`;
  // writeFileSync(distSecretsJsonPath, JSON.stringify(secretsJson, null, 2));
};

run();
