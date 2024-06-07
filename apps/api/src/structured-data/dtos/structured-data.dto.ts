import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class StructuredDataDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  prompt: string;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(200)
  url: string;

  @IsNotEmpty()
  schema: any; // TODO Use proper validation
}
