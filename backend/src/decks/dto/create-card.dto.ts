import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  frontText!: string;

  @IsString()
  @IsNotEmpty()
  backText!: string;
}
