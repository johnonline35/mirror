import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { StructuredDataService } from './structured-data.service';
import { StructuredDataDto } from './dtos/structured-data.dto';
import { ClientAuthGuard } from '../../common/guards/client-auth.guard';
import { ClientService } from '../../common/services/client/client.service';
import { JobManagerService } from '../../job-manager/job-manager.service';
import { AuthService } from '../../common/services/auth/auth.service';

@Controller('structured-data')
@UseGuards(ClientAuthGuard)
export class StructuredDataController {
  constructor(
    private readonly structuredDataService: StructuredDataService,
    private readonly clientService: ClientService,
    private readonly jobManagerService: JobManagerService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body() requestDto: StructuredDataDto,
    @Headers('authorization') authHeader: string,
  ) {
    const clientId = this.authService.extractClientIdFromHeader(authHeader);

    const client = await this.clientService.findClientById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found.`);
    }

    const { jobId } = await this.structuredDataService.startJobAsync(
      requestDto,
      clientId,
    );

    return { jobId };
  }

  @Get('status/:jobId')
  @HttpCode(HttpStatus.OK)
  async getJobStatus(
    @Param('jobId') jobId: string,
    @Headers('authorization') authHeader: string,
  ) {
    const clientId = this.authService.extractClientIdFromHeader(authHeader);

    const job = await this.jobManagerService.getJobStatus(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found.`);
    }

    if (job.clientId !== clientId) {
      throw new ForbiddenException('Unauthorized access to job status');
    }

    return {
      jobId: job.jobId,
      status: job.status,
      result: job.status === 'completed' ? job.s3Url : null,
    };
  }
}
