import { Test, TestingModule } from '@nestjs/testing';
import { S3 } from 'aws-sdk';
import {
  createAwsServiceMock,
  createAwsServicePromisableSpy,
  getAwsServiceMock,
} from 'nest-aws-sdk/dist/testing';
import { S3ManagerService } from './s3-manager.service';

describe('S3ManagerService', () => {
  describe('listBucketContents()', () => {
    it('should call the list method and return the Content keys', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3ManagerService,
          createAwsServiceMock(S3, {
            useValue: {
              listObjectsV2: () => null,
            },
          }),
        ],
      }).compile();

      const service = module.get(S3ManagerService);

      const listSpy = createAwsServicePromisableSpy(
        getAwsServiceMock(module, S3),
        'listObjectsV2',
        'resolve',
        {
          Contents: [{ Key: 'myKey' }],
        },
      );

      const result = await service.listBucketContents('myBucket');

      expect(result.length).toBe(1);
      expect(result[0]).toBe('myKey');
      expect(listSpy).toHaveBeenCalledTimes(1);
      expect(listSpy).toHaveBeenCalledWith({ Bucket: 'myBucket' });
    });
  });
});
