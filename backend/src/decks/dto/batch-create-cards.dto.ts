import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CardDifficulty } from '../../ai/dto/generate-cards.dto';

class CardItemDto {
  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}

export class BatchCreateCardsDto {
  @IsString()
  @IsOptional()
  newDeckTitle?: string;

  @IsString()
  @IsOptional()
  newDeckDescription?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardItemDto)
  cards!: CardItemDto[];

  @IsEnum(CardDifficulty)
  @IsOptional()
  difficulty?: CardDifficulty;
}
