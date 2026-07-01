import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDeckDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsNumber()
  @Min(1.3)
  initialEasinessFactor?: number;
}
