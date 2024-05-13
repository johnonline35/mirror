// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { DataPreprocessorService } from './data-preprocessor.service';
// import { CreateDataPreprocessorDto } from './dto/create-data-preprocessor.dto';
// import { UpdateDataPreprocessorDto } from './dto/update-data-preprocessor.dto';

// @Controller('data-preprocessor')
// export class DataPreprocessorController {
//   constructor(private readonly dataPreprocessorService: DataPreprocessorService) {}

//   @Post()
//   create(@Body() createDataPreprocessorDto: CreateDataPreprocessorDto) {
//     return this.dataPreprocessorService.create(createDataPreprocessorDto);
//   }

//   @Get()
//   findAll() {
//     return this.dataPreprocessorService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.dataPreprocessorService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateDataPreprocessorDto: UpdateDataPreprocessorDto) {
//     return this.dataPreprocessorService.update(+id, updateDataPreprocessorDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.dataPreprocessorService.remove(+id);
//   }
// }
