import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  clientSecret: string;
}
