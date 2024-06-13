import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { StructuredDataDto } from './../src/structured-data/dtos/structured-data.dto';

describe('StructuredDataController (e2e)', () => {
  let app: INestApplication;
  const logger = new Logger('E2E Test');

  beforeAll(async () => {
    logger.log('Initializing E2E Test Suite...');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /structured-data/status/:jobId', () => {
    it('should return job status', async () => {
      const requestDto: StructuredDataDto = {
        prompt: 'Find the phone numbers',
        url: 'https://www.neosync.dev/',
        schema: '{phone: string}',
      };

      // First, create a job
      const createResponse = await request(app.getHttpServer())
        .post('/structured-data')
        .send(requestDto)
        .expect(201);

      const { jobId } = createResponse.body;

      // Then, get the job status
      const statusResponse = await request(app.getHttpServer())
        .get(`/structured-data/status/${jobId}`)
        .expect(200);

      expect(statusResponse.body).toHaveProperty('jobId', jobId);
      expect(statusResponse.body).toHaveProperty('status');
    });
  });
});
