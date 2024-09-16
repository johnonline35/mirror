import { Injectable, BadRequestException } from '@nestjs/common';
import { Parser } from 'json2csv';

@Injectable()
export class JsonToCsvService {
  async convertJsonToCsv(jsonData: any): Promise<string> {
    try {
      if (!Array.isArray(jsonData)) {
        throw new BadRequestException(
          'Input data should be an array of objects',
        );
      }
      const parser = new Parser();
      const csv = parser.parse(jsonData);
      return csv;
    } catch (error) {
      throw new BadRequestException(
        `Failed to convert JSON to CSV: ${error.message}`,
      );
    }
  }
}
