import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';

export enum CardDifficulty {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HARD = 'hard',
  ULTRA = 'ultra',
}

export class GenerateCardsDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  count?: number;

  @IsEnum(CardDifficulty)
  @IsOptional()
  difficulty?: CardDifficulty;

  @IsString()
  @IsOptional()
  deckTitle?: string;

  @IsString()
  @IsOptional()
  deckDescription?: string;
}
