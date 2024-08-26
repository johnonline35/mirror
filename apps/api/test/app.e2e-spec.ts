import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { StructuredDataDto } from './../src/endpoints/structured-data/dtos/structured-data.dto';

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
          'Determine whether the website is B2B or B2C. Identify and extract all end customer use cases, if available. For each use case, provide the following details: customer name, use case description, and the likely industries served by that customer in the specific use case. If there are no customer use cases, then use the information you have to summarize what the main value proposition of this business is, describe the products, and then make an educted guess as to what industries the end customers are like in.',
        url: 'https://www.flatfrog.com/',
        schema: {
          businessModel: 'b2b' || 'b2c',
          hasUseCases: 'Boolean',
          useCases: [
            {
              url: 'string',
              customerName: 'string',
              useCaseDescription: 'string',
              industries: [{ industry: 'string' }],
            },
          ],
        },
      };
      // const requestDto: StructuredDataDto = {
      //   prompt:
      //     'Extract each story including the url for the story itself as well as any available information about the date and the author, and summarize the story into one paragraph',
      //   url: 'https://www.news.com.au',
      //   schema: {
      //     url: 'string',
      //     headline: 'string',
      //     storyDescription: 'string',
      //     metaData: [{ date: 'string', author: 'string' }],
      //   },
      // };
      // const requestDto: StructuredDataDto = {
      //   prompt:
      //     'Find and store in json the name of the business, its street address, phone number(s), email address, opening hours, list the products or services it offers and any available pricing. If some information is available and some information is missing then just return null for anything not there',
      //   url: 'https://www.awakenedyogastudio.com/',
      //   schema: {
      //     companyName: 'string',
      //     companyDescription: 'string',
      //     addresses: [
      //       {
      //         address: 'string',
      //       },
      //     ],
      //     phoneNumbers: [
      //       {
      //         number: 'string',
      //       },
      //     ],
      //     emails: [
      //       {
      //         email: 'string',
      //         descriptionOfEmail: 'string',
      //       },
      //     ],
      //     socials: [
      //       {
      //         name: 'string',
      //         url: 'string',
      //       },
      //     ],
      //     openingHours: [
      //       {
      //         day: 'string',
      //         openTime: 'string',
      //         closeTime: 'string',
      //       },
      //     ],
      //     productsAndServices: [
      //       {
      //         name: 'string',
      //         description: 'string',
      //         price: 'string',
      //       },
      //     ],
      //   },
      // };

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
    }, 680000);
  });
});

[
  {
    url: 'https://www.flatfrog.com/use-cases/free-kanban-board',
    customerName: 'null',
    useCaseDescription:
      'Kanban boards for project management and workflow visualization.',
    industries: [
      { industry: 'Project Management' },
      { industry: 'Software Development' },
      { industry: 'Corporate' },
    ],
  },
  {
    url: 'https://www.flatfrog.com/use-cases/free-online-retrospective-software',
    customerName: 'null',
    useCaseDescription:
      'Retrospective tools for team reflection and improvement.',
    industries: [
      { industry: 'Agile Teams' },
      { industry: 'Software Development' },
      { industry: 'Corporate' },
    ],
  },
  {
    url: 'https://www.flatfrog.com/use-cases/free-online-sprint-planning-board-signup',
    customerName: 'null',
    useCaseDescription: 'Sprint planning boards for agile project management.',
    industries: [
      { industry: 'Agile Teams' },
      { industry: 'Software Development' },
      { industry: 'Corporate' },
    ],
  },
  {
    url: 'https://www.flatfrog.com/use-cases/free-online-ideation-board',
    customerName: 'null',
    useCaseDescription: 'Ideation boards for brainstorming and innovation.',
    industries: [
      { industry: 'Creative Teams' },
      { industry: 'Marketing' },
      { industry: 'Corporate' },
    ],
  },
  {
    url: 'https://www.flatfrog.com/use-cases/free-online-workshop-board',
    customerName: 'null',
    useCaseDescription: 'Workshop board for interactive sessions and training.',
    industries: [
      { industry: 'Training and Development' },
      { industry: 'Education' },
    ],
  },
  {
    url: 'https://www.flatfrog.com/use-cases/hybrid-work-whiteboard',
    customerName: 'null',
    useCaseDescription:
      'Hybrid work whiteboard for remote and in-office collaboration.',
    industries: [
      { industry: 'Remote Work Solutions' },
      { industry: 'Corporate' },
    ],
  },
  {
    url: 'https://www.flatfrog.com/customer-stories/gigalogchip',
    customerName: 'Gigalogchip',
    useCaseDescription:
      'Engaging whiteboard sessions replace PowerPoint lectures, allowing students to ask questions and contribute in real time to material on the board.',
    industries: [{ industry: 'Education' }],
  },
  {
    url: 'https://www.flatfrog.com/customer-stories/backer-bhv-ab',
    customerName: 'Backer BHV AB',
    useCaseDescription:
      'Digital InGlass™ displays with a digital whiteboard are an essential component of this digital transformation.',
    industries: [{ industry: 'Manufacturing' }],
  },
  {
    url: 'https://www.flatfrog.com/customer-stories/ameriprise-utg',
    customerName: 'Ameriprise Financial',
    useCaseDescription:
      'The ability to annotate right over the data so it’s easily understood and shared was a paramount part of the checklist.',
    industries: [{ industry: 'Services' }],
  },
  {
    url: 'https://www.flatfrog.com/customer-stories/city-of-seattle',
    customerName: 'City of Seattle',
    useCaseDescription:
      'Since visitors have no time for training, they require an immediate tool that is intuitive and natural to use.',
    industries: [{ industry: 'Government' }],
  },
  {
    url: 'https://www.flatfrog.com/customer-stories/axis-communications',
    customerName: 'Axis Communications',
    useCaseDescription:
      'Newly purchased InGlass™ displays with FlatFrog Board enable the team to replace many unsecured whiteboards with a single secured InGlass™ display.',
    industries: [{ industry: 'Manufacturing' }],
  },
  { industry: 'Technology' },
  { industry: 'Education' },
  { industry: 'Corporate' },
  { industry: 'Manufacturing' },
  { industry: 'Services' },
  { industry: 'Government' },
  { industry: 'Creative Services' },
  { industry: 'Remote Work Solutions' },
  { industry: 'Training and Development' },
];
