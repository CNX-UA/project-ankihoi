import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsNumber()
  @IsOptional()
  easinessFactor?: number;

  @IsNumber()
  @IsOptional()
  repetitions?: number;

  @IsNumber()
  @IsOptional()
  intervalDays?: number;

  @IsDateString()
  @IsOptional()
  nextReview?: string;
}
