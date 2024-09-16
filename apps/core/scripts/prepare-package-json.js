/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFileSync, rmSync, existsSync, mkdirSync } = require('fs');
const packageJson = require('../package.json');

if (existsSync('server/package.json')) {
  rmSync('server/package.json');
}

const deployablePackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  dependencies: packageJson.dependencies,
};

delete deployablePackageJson.dependencies['nest-openapi-tools'];
delete deployablePackageJson.dependencies.rimraf;

if (!existsSync('server')) {
  mkdirSync('server');
}

writeFileSync('server/package.json', JSON.stringify(deployablePackageJson), {
  flag: 'wx',
});

if (existsSync('server/package-lock.json')) {
  rmSync('server/package-lock.json');
}
