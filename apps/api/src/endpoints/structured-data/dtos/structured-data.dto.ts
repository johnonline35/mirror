import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class StructuredDataDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  prompt: string;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(300)
  url: string;

  @IsNotEmpty()
  schema: any; // TODO Use proper validation
}
