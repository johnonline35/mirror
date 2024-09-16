import { handler } from './index';

describe('Lambda Handler Integration Tests', () => {
  it('should return HTML content for a valid URL', async () => {
    const testUrl = 'https://www.neosync.dev/';
    const event = {
      body: JSON.stringify({ url: testUrl }),
    };

    const response = await handler(event);

    if (typeof response === 'string') {
      // Handle the case where response is 'warmed'
      expect(response).toBe('warmed');
    } else {
      // Now we can safely assume response has statusCode and body
      expect(response.statusCode).toBe(200);
      const responseBody = JSON.parse(response.body);
      expect(responseBody.html).toContain('<html');
    }
  }, 120000);

  //   it('should handle errors gracefully when the URL is bad', async () => {
  //     const badUrl = 'https://thisurldoesnotexist.comtotallyfake';
  //     const event = {
  //       body: JSON.stringify({ url: badUrl }),
  //     };

  //     const response = await handler(event);

  //     if (typeof response === 'string') {
  //       // Unexpected, so we should consider what to do in this case
  //       expect(response).not.toBe('warmed');
  //     } else {
  //       expect(response.statusCode).toBe(500);
  //       const responseBody = JSON.parse(response.body);
  //       expect(responseBody.error).toBeDefined();
  //     }
  //   });

  // it('should return warmed if triggered by a lambda warmer', async () => {
  //   const event = {}; // Simulating a lambda warmer event
  //   const response = await handler(event);

  //   // Directly check for 'warmed'
  //   expect(response).toBe('warmed');
  // });
});
