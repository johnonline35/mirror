import { PartialType } from '@nestjs/mapped-types';
import { CreateCrawlerDto } from './CrawlRequestDto.dto';

export class UpdateCrawlerDto extends PartialType(CreateCrawlerDto) {
  status?: string;
  data?: any;
}
