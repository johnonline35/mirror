const { exec } = require('child_process');
const dotenv = require('dotenv');
const { readFileSync } = require('fs');

const configs = {
  staging: {
    functionName: '',
  },
  production: {
    functionName: '',
  },
};

const run = async () => {
  const configName = process.argv.pop().replace('--', '');
  const config = configs[configName];

  const contentResultsJson = await new Promise((resolve) => {
    exec(
      `aws lambda get-function-configuration --function-name ${config.functionName} --profile zipper`,
      (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(err);
        } else {
          resolve(stdout);
        }
      },
    );
  });

  const file = dotenv.parse(readFileSync(__dirname + `/../.env.${configName}`));
  const contentResults = JSON.parse(contentResultsJson);

  contentResults.Environment.Variables = {
    ...contentResults.Environment.Variables,
    ...file,
  };

  const envVarsJson = JSON.stringify({
    Variables: contentResults.Environment.Variables,
  });

  await new Promise((resolve) => {
    exec(
      `aws lambda update-function-configuration --function-name ${config.functionName} --environment '${envVarsJson}' --profile zipper`,
      (err, stdout) => {
        if (err) {
          //some err occurred
          console.error(err);
        } else {
          resolve(stdout);
        }
      },
    );
  });
};

run();
