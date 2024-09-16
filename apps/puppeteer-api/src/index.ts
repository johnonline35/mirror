import { INestApplicationContext } from '@nestjs/common';
import { bootstrap } from './bootstrap';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import warmer from 'lambda-warmer';

let nestApp: INestApplicationContext;

export const handler = async (event: any) => {
  console.log('inside lambda handler', JSON.stringify(event, null, 2));

  if (!nestApp) {
    nestApp = await bootstrap();
  }

  if (await warmer(event)) return 'warmed';

  const puppeteerService = nestApp.get<PuppeteerService>(PuppeteerService);

  try {
    let url: string;

    // Check if event.body exists and is a valid JSON string
    if (event.body && typeof event.body === 'string') {
      try {
        const body = JSON.parse(event.body);
        url = body.url;
      } catch (parseError) {
        console.error('Error parsing event body:', parseError);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        };
      }
    } else if (event.queryStringParameters && event.queryStringParameters.url) {
      // Fallback to query string parameters if body is not available
      url = event.queryStringParameters.url;
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'URL not provided in request body or query parameters',
        }),
      };
    }

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    const html = await puppeteerService.runPuppeteer(url);

    return {
      statusCode: 200,
      body: JSON.stringify({ html }),
    };
  } catch (error) {
    console.error('Error in Lambda Handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
    };
  }
};
