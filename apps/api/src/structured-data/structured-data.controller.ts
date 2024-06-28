import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StructuredDataService } from './structured-data.service';
import { StructuredDataDto } from './dtos/structured-data.dto';

@Controller('structured-data')
export class StructuredDataController {
  constructor(private readonly structuredDataService: StructuredDataService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(@Body() requestDto: StructuredDataDto) {
    const { jobId, result } =
      await this.structuredDataService.handle(requestDto);
    return { jobId, result };
  }

  @Get('status/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const job = await this.structuredDataService.getJobStatus(jobId);
    return job;
  }
}
