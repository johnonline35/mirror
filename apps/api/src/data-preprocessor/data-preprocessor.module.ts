import { Module } from '@nestjs/common';
import { DataPreprocessorService } from './data-preprocessor.service';
import { PrismaModule } from '../../prisma/prisma.module';
// import { DataPreprocessorController } from './data-preprocessor.controller';

@Module({
  imports: [PrismaModule],
  // controllers: [DataPreprocessorController],
  providers: [DataPreprocessorService],
  exports: [DataPreprocessorService],
})
export class DataPreprocessorModule {}
