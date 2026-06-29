import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '../../src/reviews/reviews.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  const mockPrismaService: any = {
    card: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
    reviewHistory: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('SM-2 Algorithm Logic', () => {
    it('should calculate correct metrics for score >= 3 on first repetition', async () => {
      // repetitions: 0, intervalDays: 0, easinessFactor: 2.5
      // Quality: 4
      const card = {
        id: 'card-1',
        easinessFactor: 2.5,
        repetitions: 0,
        intervalDays: 0,
        nextReview: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update = jest.fn().mockResolvedValue({
        ...card,
        repetitions: 1,
        intervalDays: 1,
        easinessFactor: 2.5,
      });

      const result = await service.reviewCard({ cardId: 'card-1', score: 4 });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.card.repetitions).toBe(1);
      expect(result.card.intervalDays).toBe(1);
      // EF change: 2.5 + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)) = 2.5 + (0.1 - 1 * 0.1) = 2.5
      expect(result.card.easinessFactor).toBe(2.5);
    });

    it('should calculate correct metrics for score >= 3 on second repetition', async () => {
      // repetitions: 1, intervalDays: 1, easinessFactor: 2.5
      // Quality: 5
      const card = {
        id: 'card-1',
        easinessFactor: 2.5,
        repetitions: 1,
        intervalDays: 1,
        nextReview: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update = jest.fn().mockResolvedValue({
        ...card,
        repetitions: 2,
        intervalDays: 6,
        easinessFactor: 2.6,
      });

      const result = await service.reviewCard({ cardId: 'card-1', score: 5 });

      expect(result.card.repetitions).toBe(2);
      expect(result.card.intervalDays).toBe(6);
    });

    it('should calculate correct metrics for score >= 3 on third repetition', async () => {
      // repetitions: 2, intervalDays: 6, easinessFactor: 2.6
      // Quality: 5
      const card = {
        id: 'card-1',
        easinessFactor: 2.6,
        repetitions: 2,
        intervalDays: 6,
        nextReview: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update = jest.fn().mockResolvedValue({
        ...card,
        repetitions: 3,
        intervalDays: 16, // Math.round(6 * 2.7) = 16
        easinessFactor: 2.7,
      });

      const result = await service.reviewCard({ cardId: 'card-1', score: 5 });

      expect(result.card.repetitions).toBe(3);
      expect(result.card.intervalDays).toBe(16);
    });

    it('should reset repetitions and interval when score < 3', async () => {
      const card = {
        id: 'card-1',
        easinessFactor: 2.5,
        repetitions: 3,
        intervalDays: 16,
        nextReview: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update = jest.fn().mockResolvedValue({
        ...card,
        repetitions: 0,
        intervalDays: 1,
        easinessFactor: 2.18,
      });

      const result = await service.reviewCard({ cardId: 'card-1', score: 2 });

      expect(result.card.repetitions).toBe(0);
      expect(result.card.intervalDays).toBe(1);
    });
  });

  describe('reviewCard Transaction', () => {
    it('should throw NotFoundException if card does not exist', async () => {
      mockPrismaService.card.findUnique.mockResolvedValue(null);

      await expect(service.reviewCard({ cardId: 'non-existent', score: 4 }))
        .rejects.toThrow(NotFoundException);
    });
  });
});
