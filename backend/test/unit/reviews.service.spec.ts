import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '../../src/reviews/reviews.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: any;

  const mockPrismaService: any = {
    card: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
      const card = {
        id: 'card-1',
        easinessFactor: 2.5,
        repetitions: 0,
        intervalDays: 0,
        nextReview: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update.mockImplementation(({ data }) => Promise.resolve({ ...card, ...data }));

      const result = await service.reviewCard({ cardId: 'card-1', score: 4 });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.card.repetitions).toBe(1);
      expect(result.card.intervalDays).toBe(1);
      expect(result.card.easinessFactor).toBe(2.5);
    });

    it('should calculate correct metrics for score >= 3 on second repetition', async () => {
      const card = {
        id: 'card-1',
        easinessFactor: 2.5,
        repetitions: 1,
        intervalDays: 1,
        nextReview: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update.mockImplementation(({ data }) => Promise.resolve({ ...card, ...data }));

      const result = await service.reviewCard({ cardId: 'card-1', score: 5 });

      expect(result.card.repetitions).toBe(2);
      expect(result.card.intervalDays).toBe(6);
      expect(result.card.easinessFactor).toBe(2.6);
    });

    it('should calculate correct metrics for score >= 3 on third repetition', async () => {
      const card = {
        id: 'card-1',
        easinessFactor: 2.6,
        repetitions: 2,
        intervalDays: 6,
        nextReview: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update.mockImplementation(({ data }) => Promise.resolve({ ...card, ...data }));

      const result = await service.reviewCard({ cardId: 'card-1', score: 5 });

      expect(result.card.repetitions).toBe(3);
      expect(result.card.intervalDays).toBe(16);
      expect(result.card.easinessFactor).toBe(2.7);
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
      mockPrismaService.card.update.mockImplementation(({ data }) => Promise.resolve({ ...card, ...data }));

      const result = await service.reviewCard({ cardId: 'card-1', score: 2 });

      expect(result.card.repetitions).toBe(0);
      expect(result.card.intervalDays).toBe(1);
    });
  });

  describe('Timezone Offset and Scheduling Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-29T12:00:00.000Z')); // 12:00 UTC
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should correctly schedule nextReview for UTC+9 (Tokyo, offset -540) with interval 1 day', async () => {
      const card = {
        id: 'card-1',
        easinessFactor: 2.5,
        repetitions: 0,
        intervalDays: 0,
        nextReview: new Date(),
      };
      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update.mockImplementation(({ data }) => Promise.resolve({ ...card, ...data }));

      const result = await service.reviewCard({ cardId: 'card-1', score: 4, timezoneOffset: -540 });

      // Tokyo time at 'now': 2026-06-29 12:00 UTC + 9h = 2026-06-29 21:00.
      // Next review interval = 1 day.
      // Next day: 2026-06-30. Local midnight: 2026-06-30 00:00:00 UTC+9.
      // UTC conversion: 2026-06-29 15:00:00 UTC.
      expect(result.card.nextReview.toISOString()).toBe('2026-06-29T15:00:00.000Z');
    });

    it('should correctly schedule nextReview for UTC-5 (New York, offset 300) with interval 1 day', async () => {
      const card = {
        id: 'card-1',
        easinessFactor: 2.5,
        repetitions: 0,
        intervalDays: 0,
        nextReview: new Date(),
      };
      mockPrismaService.card.findUnique.mockResolvedValue(card);
      mockPrismaService.card.update.mockImplementation(({ data }) => Promise.resolve({ ...card, ...data }));

      const result = await service.reviewCard({ cardId: 'card-1', score: 4, timezoneOffset: 300 });

      // NY time at 'now': 2026-06-29 12:00 UTC - 5h = 2026-06-29 07:00.
      // Next review interval = 1 day.
      // Next day: 2026-06-30. Local midnight: 2026-06-30 00:00:00 UTC-5.
      // UTC conversion: 2026-06-30 05:00:00 UTC.
      expect(result.card.nextReview.toISOString()).toBe('2026-06-30T05:00:00.000Z');
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
