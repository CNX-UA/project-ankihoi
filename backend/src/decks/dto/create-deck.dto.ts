import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDeckDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
