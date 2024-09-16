import { Injectable } from '@nestjs/common';
import * as JSON5 from 'json5';

@Injectable()
export class JsonExtractionService {
  extractValidJson(text: string): object[] {
    const jsonObjects: object[] = [];
    const jsonRegex = /{(?:[^{}]|{[^{}]*})*}/g;
    let match;

    while ((match = jsonRegex.exec(text)) !== null) {
      try {
        const jsonString = match[0].trim();
        const jsonObject = JSON5.parse(jsonString);
        jsonObjects.push(jsonObject);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Failed JSON string:', match[0]);
      }
    }

    if (jsonObjects.length === 0) {
      console.warn('No valid JSON found in the text.');
    }

    return jsonObjects;
  }
}
