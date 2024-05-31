import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class StructuredDataDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  prompt: string;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  url: string;

  @IsNotEmpty()
  schema: any; // TODO Use proper validation
}
