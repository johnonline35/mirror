import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { StructuredDataDto } from './../src/structured-data/dtos/structured-data.dto';

describe('StructuredDataController (e2e)', () => {
  let app: INestApplication;
  const logger = new Logger('E2E Test');

  beforeAll(async () => {
    console.log('Initializing E2E Test Suite...');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    console.log('NestJS Application Initialized');
  });

  afterAll(async () => {
    console.log('Closing NestJS Application');
    await app.close();
    setTimeout(() => {
      logger.log('Forcefully closing remaining handles');
      process.exit(0);
    }, 5000).unref();
    console.log('NestJS Application Closed');
  });

  describe('POST /structured-data', () => {
    it('should create a job and return jobId and result', async () => {
      const requestDto: StructuredDataDto = {
        prompt:
          'Find the products and list them from the company. Also classify if the site is b2b or b2c. Lastly list the industries of all the customers of the website',
        url: 'https://airtree.vc/',
        schema: {
          products: 'string[]',
          category: 'b2b | b2c',
          industries: 'string',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/structured-data')
        .send(requestDto)
        .expect(201);

      console.log('response body:', response.body);

      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('result');
      // expect(response.body.result).toMatchObject({
      //   products: expect.any(Array),
      //   category: expect.any(String),
      //   industries: expect.any(String),
      // });
    }, 50000);
  });

  // describe('GET /structured-data/status/:jobId', () => {
  //   it('should return job status and result', async () => {
  //     const requestDto: StructuredDataDto = {
  //       prompt:
  //         'Find the products and list them from the company. Also classify if the site is b2b or b2c. Lastly list the industries of all the customers of the website',
  //       url: 'https://www.neosync.dev/',
  //       schema: {
  //         products: 'string[]',
  //         category: 'b2b | b2c',
  //         industries: 'string',
  //       },
  //     };

  //     // First, create a job
  //     const createResponse = await request(app.getHttpServer())
  //       .post('/structured-data')
  //       .send(requestDto)
  //       .expect(201);

  //     const { jobId, result } = createResponse.body;

  //     // Then, get the job status
  //     const statusResponse = await request(app.getHttpServer())
  //       .get(`/structured-data/status/${jobId}`)
  //       .expect(200);

  //     expect(statusResponse.body).toHaveProperty('jobId', jobId);
  //     expect(statusResponse.body).toHaveProperty('status');
  //     expect(statusResponse.body).toHaveProperty('result');
  //     expect(statusResponse.body.result).toMatchObject(result);
  //   }, 20000);
  // });
});
