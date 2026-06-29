import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  cardId!: string;

  @IsInt()
  @Min(0)
  @Max(5)
  score!: number;
}
