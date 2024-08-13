/* eslint-disable @typescript-eslint/no-var-requires */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const execAsync = promisify(exec);

const s3Client = new S3Client({ region: 'us-east-1' });

async function listZipContents(zipFile) {
  try {
    const { stdout } = await execAsync(`unzip -l ${zipFile} | head -n 40`);
    console.log('First 40 entries in zip file:');
    console.log(stdout);

    const { stdout: totalFiles } = await execAsync(
      `unzip -l ${zipFile} | wc -l`,
    );
    console.log(`Total number of files in zip: ${parseInt(totalFiles) - 4}`); // Subtract 4 for header and footer lines

    const { stdout: totalSize } = await execAsync(
      `unzip -l ${zipFile} | tail -n 1`,
    );
    console.log(`Total size of zip: ${totalSize.trim().split(/\s+/)[2]} bytes`);
  } catch (error) {
    console.error('Error listing zip contents:', error);
  }
}

async function prepareLambdaPackage(bucketName) {
  if (!bucketName || typeof bucketName !== 'string') {
    throw new Error(`Invalid bucket name: ${bucketName}`);
  }
  try {
    const BUCKET_NAME = bucketName;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const zipFileName = `api-${timestamp}.zip`;

    console.log('Zipping project...');
    await execAsync(`cd server && zip -r ../${zipFileName} . -x '*.git*'`, {
      maxBuffer: 50 * 1024 * 1024, // 50MB in bytes
    });

    await listZipContents(zipFileName);

    console.log('Uploading to S3...');
    const fileContent = await fs.readFile(zipFileName);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: zipFileName,
        Body: fileContent,
      }),
    );

    console.log('Cleaning up...');
    await fs.unlink(zipFileName);

    console.log('Lambda package prepared and uploaded successfully!');
    return zipFileName;
  } catch (error) {
    console.error('Lambda package preparation failed:', error);
    throw error;
  }
}

module.exports = prepareLambdaPackage;
