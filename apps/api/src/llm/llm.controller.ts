import { Controller } from '@nestjs/common';
import { LlmService } from './langchain.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}
}
