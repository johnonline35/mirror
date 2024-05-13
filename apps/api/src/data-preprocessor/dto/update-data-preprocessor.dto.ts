import { PartialType } from '@nestjs/swagger';
import { CreateDataPreprocessorDto } from './create-data-preprocessor.dto';

export class UpdateDataPreprocessorDto extends PartialType(CreateDataPreprocessorDto) {}
