/* eslint-disable @typescript-eslint/no-var-requires */
const {
  LambdaClient,
  GetFunctionCommand,
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand,
} = require('@aws-sdk/client-lambda');
const dotenv = require('dotenv');
const { readFileSync } = require('fs');
const prepareLambdaPackage = require('./prepare-lambda-package');

const configs = {
  staging: {
    functionName: 'ApiStaging-AnyCatchallHTTPLambda-xqZjAMsuoaIt',
    bucketName: 'apistaging-staticbucket-vdz1x7klxfro',
  },
  production: {
    functionName: '', // You'll need to update this when you deploy to production
    bucketName: 'production-api-lambda-bucket',
  },
};

const run = async () => {
  const configName = process.argv.pop().replace('--', '');
  const config = configs[configName];

  const client = new LambdaClient({ region: 'us-east-1' });

  try {
    // Check if the function exists
    const getFunctionCommand = new GetFunctionCommand({
      FunctionName: config.functionName,
    });

    try {
      await client.send(getFunctionCommand);
      console.log(`Function ${config.functionName} exists.`);
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        console.error(
          `Function ${config.functionName} does not exist. Please create it first.`,
        );
        return;
      }
      throw error;
    }
    // Prepare and upload Lambda package
    const s3Key = await prepareLambdaPackage(config.bucketName);

    // Get current function configuration
    const getFunctionConfigCommand = new GetFunctionConfigurationCommand({
      FunctionName: config.functionName,
    });
    const currentConfig = await client.send(getFunctionConfigCommand);

    // Read environment variables from .env file
    const file = dotenv.parse(
      readFileSync(__dirname + `/../.env.${configName}`),
    );

    // Merge current environment variables with new ones
    const updatedEnvVars = {
      ...currentConfig.Environment?.Variables,
      ...file,
    };

    // Update function configuration
    const updateFunctionCommand = new UpdateFunctionConfigurationCommand({
      FunctionName: config.functionName,
      Environment: { Variables: updatedEnvVars },
      S3Bucket: config.bucketName,
      S3Key: s3Key,
    });
    await client.send(updateFunctionCommand);

    console.log('Function configuration and code updated successfully');
  } catch (error) {
    console.error('Error updating function:', error);
  }
};

run();
