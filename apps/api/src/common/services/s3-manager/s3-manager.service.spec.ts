// import { Test, TestingModule } from '@nestjs/testing';
// import { S3Client } from '@aws-sdk/client-s3';
// import { S3ManagerService } from './s3-manager.service';
// import { ConfigModule } from '@nestjs/config';

// describe('S3ManagerService', () => {
//   let service: S3ManagerService;
//   let s3Client: S3Client;

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [ConfigModule.forRoot()], // This loads environment variables
//       providers: [
//         S3ManagerService,
//         {
//           provide: S3Client,
//           useValue: new S3Client({
//             region: process.env.AWS_REGION || 'us-east-1',
//           }),
//         },
//       ],
//     }).compile();

//     service = module.get<S3ManagerService>(S3ManagerService);
//     s3Client = module.get<S3Client>(S3Client);
//   });

//   afterAll(async () => {
//     s3Client.destroy();
//   });

//   describe('listBucketContents()', () => {
//     const testBucketName = 'mirror-puppeteer-api-cfn-deployments-17f6f'; // Replace with your actual test bucket name

//     it('should list bucket contents', async () => {
//       const result = await service.listBucketContents(testBucketName);
//       expect(Array.isArray(result)).toBeTruthy();
//       // Add more specific assertions based on what you expect in your test bucket
//     });

//     it('should throw an error for a non-existent bucket', async () => {
//       await expect(
//         service.listBucketContents('non-existent-bucket-name'),
//       ).rejects.toThrow();
//     });
//   });
// });
