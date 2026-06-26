import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Card, ReviewHistory } from '@prisma/client';

export interface ReviewResponse {
  card: Card;
  reviewHistory: ReviewHistory;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reviews a card, calculates new spaced repetition metrics using the SM-2 algorithm,
   * and saves the updated card state and history record in a single transaction.
   */
  async reviewCard(dto: CreateReviewDto): Promise<ReviewResponse> {
    return this.prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({
        where: { id: dto.cardId },
      });

      if (!card) {
        throw new NotFoundException(`Card with ID ${dto.cardId} not found`);
      }

      // Calculate SM-2 updates
      const { repetitions, intervalDays, easinessFactor } = this.calculateSM2(
        dto.score,
        card.repetitions,
        card.intervalDays,
        card.easinessFactor,
      );

      // Calculate the next review date
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + intervalDays);
      // Zero out hours, minutes, seconds for clean dates if needed, or leave precise
      nextReview.setHours(0, 0, 0, 0);

      // Update Card
      const updatedCard = await tx.card.update({
        where: { id: card.id },
        data: {
          repetitions,
          intervalDays,
          easinessFactor,
          nextReview,
        },
      });

      // Log Review History
      const reviewHistory = await tx.reviewHistory.create({
        data: {
          cardId: card.id,
          score: dto.score,
        },
      });

      return {
        card: updatedCard,
        reviewHistory,
      };
    });
  }

  /**
   * Calculates new repetitions, interval, and easiness factor based on the SM-2 algorithm.
   */
  private calculateSM2(
    quality: number,
    repetitions: number,
    intervalDays: number,
    easinessFactor: number,
  ): {
    repetitions: number;
    intervalDays: number;
    easinessFactor: number;
  } {
    let nextRepetitions = repetitions;
    let nextIntervalDays = intervalDays;

    // Calculate new easiness factor
    let nextEasinessFactor =
      easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (nextEasinessFactor < 1.3) {
      nextEasinessFactor = 1.3;
    }

    if (quality >= 3) {
      if (nextRepetitions === 0) {
        nextIntervalDays = 1;
      } else if (nextRepetitions === 1) {
        nextIntervalDays = 6;
      } else {
        nextIntervalDays = Math.round(intervalDays * nextEasinessFactor);
      }
      nextRepetitions++;
    } else {
      nextRepetitions = 0;
      nextIntervalDays = 1;
    }

    return {
      repetitions: nextRepetitions,
      intervalDays: nextIntervalDays,
      easinessFactor: parseFloat(nextEasinessFactor.toFixed(2)),
    };
  }
}
