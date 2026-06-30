import { IsEnum, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { CardDifficulty } from './generate-cards.dto';

export enum CardStyle {
  Q_A = 'q_a',
  CLOZE = 'cloze',
  MULTIPLE_CHOICE = 'multiple_choice',
}

export class GenerateCardsMultimodalDto {
  @IsEnum(CardStyle)
  @IsNotEmpty()
  style!: CardStyle;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  count?: number;

  @IsEnum(CardDifficulty)
  @IsOptional()
  difficulty?: CardDifficulty;
}
