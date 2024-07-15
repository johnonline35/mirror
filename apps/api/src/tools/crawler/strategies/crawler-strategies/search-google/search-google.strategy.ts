// import { Injectable, Logger } from '@nestjs/common';
// import { gotScraping } from 'got-scraping';
// import * as cheerio from 'cheerio';
// import { getStormProxyUrl } from './proxies'; // TODO

// @Injectable()
// export class SearchGoogleStrategy {
//   private readonly logger = new Logger(SearchGoogleStrategy.name);

//   private jsonify(html: string | Buffer): any[] {
//     const $ = cheerio.load(html);
//     const aTags = $('a');
//     const json = [];

//     aTags.each((i, aTag) => {
//       const href = $(aTag).attr('href');
//       const h3 = $(aTag).children('h3');
//       const title = h3.text();

//       if (!title || !href || title === 'More results') return;

//       const link = {
//         title,
//         url: href,
//       };
//       json.push(link);
//     });

//     return json;
//   }

//   async crawlGoogle(query: string, page: number): Promise<any[]> {
//     try {
//       const q = query.split(' ').join('+');
//       const start = (page - 1) * 10;
//       const res = await gotScraping({
//         url: `https://www.google.com/search?q=${q}&start=${start}`,
//         proxyUrl: getStormProxyUrl(),
//       });
//       const html = res.body;
//       const json = this.jsonify(html);
//       return json;
//     } catch (error) {
//       this.logger.error('Error at crawlGoogle', error.message);
//       throw new Error('Failed to crawl Google');
//     }
//   }
// }
